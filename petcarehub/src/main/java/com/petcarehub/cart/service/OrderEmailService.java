package com.petcarehub.cart.service;

import com.petcarehub.cart.entity.CustomerOrder;
import com.petcarehub.cart.entity.OrderCancellation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class OrderEmailService {

    private static final Logger log = LoggerFactory.getLogger(OrderEmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:no-reply@petcarehub.com}")
    private String senderEmail;

    public void sendOrderCancellationEmail(CustomerOrder order, OrderCancellation cancellation) {
        if (!isMailAvailable()) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(order.getOwnerEmail());
        message.setSubject("Order Cancelled - PetCareHub");
        
        String reasonText = cancellation != null ? cancellation.getReason() : "Customer Request";

        message.setText(
                "Dear " + order.getOwnerFullName() + ",\n\n" +
                "Your order has been successfully cancelled.\n\n" +
                "Order ID: " + order.getOrderNumber() + "\n" +
                "Reason/Due to: " + reasonText + "\n\n" +
                "If you have any questions, please contact our support team.");
        send(message);
    }

    private boolean isMailAvailable() {
        if (mailSender == null) {
            log.warn("JavaMailSender is not configured – skipping email send.");
            return false;
        }
        return true;
    }

    private void send(SimpleMailMessage message) {
        try {
            mailSender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send email to {}: {}", message.getTo(), ex.getMessage());
        }
    }
}
