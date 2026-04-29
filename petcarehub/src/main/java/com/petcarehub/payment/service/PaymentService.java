package com.petcarehub.payment.service;

import com.petcarehub.appointment.entity.Appointment;
import com.petcarehub.appointment.repository.AppointmentRepository;
import com.petcarehub.appointment.service.AppointmentEmailService;
import com.petcarehub.payment.enums.PaymentStatus;
import com.petcarehub.payment.model.Payment;
import com.petcarehub.payment.repository.PaymentRepository;
import com.stripe.model.checkout.Session;
import com.petcarehub.cart.entity.CustomerOrder;
import com.petcarehub.cart.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StripeService stripeService;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentEmailService appointmentEmailService;
    private final OrderRepository orderRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          StripeService stripeService,
                          AppointmentRepository appointmentRepository,
                          AppointmentEmailService appointmentEmailService,
                          OrderRepository orderRepository) {
        this.paymentRepository = paymentRepository;
        this.stripeService = stripeService;
        this.appointmentRepository = appointmentRepository;
        this.appointmentEmailService = appointmentEmailService;
        this.orderRepository = orderRepository;
    }

    public String createCheckoutSession(Long referenceId, String referenceType) {

        boolean alreadyPaid = paymentRepository.existsByReferenceIdAndReferenceTypeAndStatus(
                referenceId,
                referenceType,
                PaymentStatus.PAID
        );

        if (alreadyPaid) {
            throw new RuntimeException("PAID");
        }

        double amount;

        if ("APPOINTMENT".equalsIgnoreCase(referenceType)) {
            Appointment appointment = appointmentRepository.findById(referenceId)
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));

            amount = appointment.getPrice();
        } else if ("ORDER".equalsIgnoreCase(referenceType)) {
            CustomerOrder order = orderRepository.findById(referenceId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            
            // Validate stock before allowing payment
            for (com.petcarehub.cart.entity.OrderItem item : order.getItems()) {
                com.petcarehub.product.entity.Product product = item.getProduct();
                if (item.getQuantity() > product.getAvailableStockQuantity()) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName());
                }
            }

            amount = order.getTotal().doubleValue();
        } else {
            throw new RuntimeException("Unsupported reference type: " + referenceType);
        }

        String[] sessionData = stripeService.createCheckoutSession(referenceId, referenceType, amount);
        String checkoutUrl = sessionData[0];
        String stripeSessionId = sessionData[1];
        String paymentIntentId = sessionData.length > 2 ? sessionData[2] : null;

        List<Payment> previousPendingPayments = paymentRepository.findByReferenceIdAndReferenceTypeAndStatus(
                referenceId, referenceType, PaymentStatus.PENDING);
                
        for (Payment p : previousPendingPayments) {
            verifyPaymentWithStripe(p);
            if (p.getStatus() == PaymentStatus.PAID) {
                throw new RuntimeException("PAID");
            } else if (p.getStatus() == PaymentStatus.PENDING) {
                try {
                    Session stripeSession = Session.retrieve(p.getStripeSessionId());
                    if ("open".equalsIgnoreCase(stripeSession.getStatus())) {
                        stripeSession.expire();
                    }
                } catch (Exception e) {
                    System.out.println("Failed to expire old session: " + e.getMessage());
                }
                p.setStatus(PaymentStatus.FAILED);
                p.setFailureReason("Abandoned due to newer payment attempt initiated.");
                paymentRepository.save(p);
            }
        }

        Payment payment = paymentRepository
                .findTopByReferenceIdAndReferenceTypeOrderByPaymentIdDesc(referenceId, referenceType)
                .orElse(null);

        if (payment == null || payment.getStatus() == PaymentStatus.PAID || payment.getStatus() == PaymentStatus.FAILED || payment.getStatus() == PaymentStatus.CANCELLED) {
            payment = new Payment();
            payment.setReferenceId(referenceId);
            payment.setReferenceType(referenceType);
        }

        payment.setAmount(amount);
        payment.setStripeSessionId(stripeSessionId);
        if (paymentIntentId != null) {
            payment.setStripePaymentIntentId(paymentIntentId);
        }
        payment.setStatus(PaymentStatus.PENDING);

        paymentRepository.save(payment);

        return checkoutUrl;
    }

    public void confirmPayment(String sessionId) {
        try {
            System.out.println("=== confirmPayment called ===");
            System.out.println("sessionId from frontend: " + sessionId);

            Session stripeSession = Session.retrieve(sessionId);
            System.out.println("Stripe session retrieved: " + stripeSession.getId());
            System.out.println("Stripe payment status: " + stripeSession.getPaymentStatus());
            System.out.println("Stripe metadata: " + stripeSession.getMetadata());

            String stripePaymentStatus = stripeSession.getPaymentStatus();
            if (stripePaymentStatus == null || !"paid".equalsIgnoreCase(stripePaymentStatus)) {
                throw new RuntimeException("Stripe payment is not marked as paid. Actual status: " + stripePaymentStatus);
            }

            String referenceIdStr = stripeSession.getMetadata().get("referenceId");
            String referenceType = stripeSession.getMetadata().get("referenceType");

            System.out.println("referenceId from metadata: " + referenceIdStr);
            System.out.println("referenceType from metadata: " + referenceType);

            if (referenceIdStr == null || referenceType == null) {
                throw new RuntimeException("Stripe session metadata is missing.");
            }

            Long referenceId = Long.parseLong(referenceIdStr);

            Payment payment = paymentRepository.findByStripeSessionId(sessionId)
                    .orElseGet(() -> paymentRepository
                            .findTopByReferenceIdAndReferenceTypeOrderByPaymentIdDesc(referenceId, referenceType)
                            .orElseThrow(() -> new RuntimeException(
                                    "Payment record not found for referenceId=" + referenceId + ", referenceType=" + referenceType
                            )));

            confirmPaymentLogic(stripeSession, payment);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to confirm payment: " + e.getMessage(), e);
        }
    }

    private void confirmPaymentLogic(Session stripeSession, Payment payment) {
        System.out.println("Matched payment row id: " + payment.getPaymentId());
        System.out.println("Matched payment status before update: " + payment.getStatus());

        if (payment.getStatus() == PaymentStatus.PAID) {
            System.out.println("Payment already marked as PAID.");
            return;
        }

        payment.setStripeSessionId(stripeSession.getId());
        if (stripeSession.getPaymentIntent() != null) {
            payment.setStripePaymentIntentId(stripeSession.getPaymentIntent());
        }
        payment.setStatus(PaymentStatus.PAID);
        paymentRepository.save(payment);

        System.out.println("Payment updated successfully to PAID. paymentId=" + payment.getPaymentId());

        if ("APPOINTMENT".equalsIgnoreCase(payment.getReferenceType())) {
            Appointment appointment = appointmentRepository.findById(payment.getReferenceId())
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));

            // Mark appointment as confirmed (UPCOMING) now that it is paid
            if ("PENDING".equalsIgnoreCase(appointment.getStatus())) {
                appointment.setStatus("UPCOMING");
                appointmentRepository.save(appointment);
                System.out.println("Appointment status updated to UPCOMING for appointmentId=" + appointment.getId());
            }

            String recipientEmail = null;

            if (appointment.getOwner() != null && appointment.getOwner().getEmail() != null
                    && !appointment.getOwner().getEmail().isBlank()) {
                recipientEmail = appointment.getOwner().getEmail();
            } else if (appointment.getUser() != null && appointment.getUser().getEmail() != null
                    && !appointment.getUser().getEmail().isBlank()) {
                recipientEmail = appointment.getUser().getEmail();
            }

            if (recipientEmail != null) {
                appointmentEmailService.sendPaymentConfirmationEmail(
                        recipientEmail,
                        appointment,
                        payment.getAmount()
                );
                System.out.println("Payment confirmation email sent to: " + recipientEmail);
            } else {
                System.out.println("No valid email found for appointment owner.");
            }
        } else if ("ORDER".equalsIgnoreCase(payment.getReferenceType())) {
            CustomerOrder order = orderRepository.findById(payment.getReferenceId())
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            
            // Deduct stock permanently upon successful card payment
            for (com.petcarehub.cart.entity.OrderItem item : order.getItems()) {
                com.petcarehub.product.entity.Product product = item.getProduct();
                product.setStockQuantity(Math.max(0, product.getStockQuantity() - item.getQuantity()));
            }

            order.setPaymentStatus(com.petcarehub.cart.enums.PaymentStatus.PAID);
            order.setOrderStatus(com.petcarehub.cart.enums.OrderStatus.PLACED);
            order.setPlacedAt(java.time.LocalDateTime.now());
            orderRepository.save(order);
            System.out.println("Order marked as PAID for orderId=" + order.getOrderId());

            String recipientEmail = null;
            if (order.getOwnerEmail() != null && !order.getOwnerEmail().isBlank()) {
                recipientEmail = order.getOwnerEmail();
            } else if (order.getUser() != null && order.getUser().getEmail() != null && !order.getUser().getEmail().isBlank()) {
                recipientEmail = order.getUser().getEmail();
            }

            if (recipientEmail != null) {
                appointmentEmailService.sendOrderPaymentConfirmationEmail(
                        recipientEmail,
                        order,
                        payment.getAmount()
                );
                System.out.println("Order payment confirmation email sent to: " + recipientEmail);
            } else {
                System.out.println("No valid email found for order.");
            }
        }
    }

    public void verifyPaymentWithStripe(Payment payment) {
        if (payment == null || payment.getStatus() != PaymentStatus.PENDING || payment.getStripeSessionId() == null) {
            return;
        }

        try {
            Session stripeSession = Session.retrieve(payment.getStripeSessionId());
            String stripePaymentStatus = stripeSession.getPaymentStatus();
            String sessionStatus = stripeSession.getStatus();

            if ("paid".equalsIgnoreCase(stripePaymentStatus)) {
                confirmPaymentLogic(stripeSession, payment);
            } else if ("expired".equalsIgnoreCase(sessionStatus)) {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Stripe session expired");
                paymentRepository.save(payment);
            }
        } catch (Exception e) {
            System.out.println("Failed to verify Stripe session for paymentId=" + payment.getPaymentId() + ": " + e.getMessage());
        }
    }

    public void failPayment(Long referenceId, String referenceType, String reason) {
        Payment payment = paymentRepository
                .findTopByReferenceIdAndReferenceTypeOrderByPaymentIdDesc(referenceId, referenceType)
                .orElse(null);

        if (payment != null && payment.getStatus() == PaymentStatus.PENDING) {
            verifyPaymentWithStripe(payment);

            if (payment.getStatus() == PaymentStatus.PENDING) {
                System.out.println("Payment kept as PENDING. Not modifying state. referenceId=" + referenceId + ", type=" + referenceType);
            }
        }
    }

    public boolean isAppointmentPaid(Long appointmentId) {
        return paymentRepository.existsByReferenceIdAndReferenceTypeAndStatus(
                appointmentId,
                "APPOINTMENT",
                PaymentStatus.PAID
        );
    }

    public PaymentStatus getAppointmentPaymentStatus(Long appointmentId) {
        return paymentRepository
                .findTopByReferenceIdAndReferenceTypeOrderByPaymentIdDesc(appointmentId, "APPOINTMENT")
                .map(Payment::getStatus)
                .orElse(null);
    }

    @Scheduled(fixedRate = 900000) // Every 15 minutes
    public void cleanupAbandonedPayments() {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        List<Payment> abandoned = paymentRepository.findByStatusAndCreatedAtBefore(PaymentStatus.PENDING, oneHourAgo);
        for (Payment p : abandoned) {
            verifyPaymentWithStripe(p);
            if (p.getStatus() == PaymentStatus.PENDING) {
                try {
                    Session stripeSession = Session.retrieve(p.getStripeSessionId());
                    if ("open".equalsIgnoreCase(stripeSession.getStatus())) {
                        stripeSession.expire();
                    }
                } catch (Exception e) {}
                
                p.setStatus(PaymentStatus.FAILED);
                p.setFailureReason("Abandoned or expired checkout session.");
                paymentRepository.save(p);
                System.out.println("Cleaned up abandoned payment via scheduled task, paymentId=" + p.getPaymentId());
            }
        }
    }
}