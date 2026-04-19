package com.petcarehub.payment.service;

import com.petcarehub.appointment.entity.Appointment;
import com.petcarehub.appointment.repository.AppointmentRepository;
import com.petcarehub.appointment.service.AppointmentEmailService;
import com.petcarehub.payment.enums.PaymentStatus;
import com.petcarehub.payment.model.Payment;
import com.petcarehub.payment.repository.PaymentRepository;
import com.stripe.model.checkout.Session;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StripeService stripeService;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentEmailService appointmentEmailService;

    public PaymentService(PaymentRepository paymentRepository,
                          StripeService stripeService,
                          AppointmentRepository appointmentRepository,
                          AppointmentEmailService appointmentEmailService) {
        this.paymentRepository = paymentRepository;
        this.stripeService = stripeService;
        this.appointmentRepository = appointmentRepository;
        this.appointmentEmailService = appointmentEmailService;
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
        } else {
            throw new RuntimeException("Unsupported reference type: " + referenceType);
        }

        String[] sessionData = stripeService.createCheckoutSession(referenceId, referenceType, amount);
        String checkoutUrl = sessionData[0];
        String stripeSessionId = sessionData[1];

        Payment payment = paymentRepository
                .findTopByReferenceIdAndReferenceTypeOrderByPaymentIdDesc(referenceId, referenceType)
                .orElse(null);

        if (payment == null || payment.getStatus() == PaymentStatus.PAID) {
            payment = new Payment();
            payment.setReferenceId(referenceId);
            payment.setReferenceType(referenceType);
        }

        payment.setAmount(amount);
        payment.setStripeSessionId(stripeSessionId);
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

            System.out.println("Matched payment row id: " + payment.getPaymentId());
            System.out.println("Matched payment status before update: " + payment.getStatus());

            if (payment.getStatus() == PaymentStatus.PAID) {
                System.out.println("Payment already marked as PAID.");
                return;
            }

            payment.setStripeSessionId(sessionId);
            payment.setStatus(PaymentStatus.PAID);
            paymentRepository.save(payment);

            System.out.println("Payment updated successfully to PAID. paymentId=" + payment.getPaymentId());

            if ("APPOINTMENT".equalsIgnoreCase(payment.getReferenceType())) {
                Appointment appointment = appointmentRepository.findById(payment.getReferenceId())
                        .orElseThrow(() -> new RuntimeException("Appointment not found"));

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
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to confirm payment: " + e.getMessage(), e);
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
}