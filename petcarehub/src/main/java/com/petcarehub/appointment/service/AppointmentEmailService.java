package com.petcarehub.appointment.service;

import com.petcarehub.auth.dto.MailBody;
import com.petcarehub.appointment.entity.Appointment;
import com.petcarehub.cart.entity.CustomerOrder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class AppointmentEmailService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentEmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:no-reply@petcarehub.com}")
    private String senderEmail;

    public void sendAppointmentConfirmation(String to, Appointment appointment) {
        if (!isMailAvailable()) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(to);
        message.setSubject("Appointment Confirmation - PetCareHub");
        message.setText(
                "Your appointment is confirmed!\n\n" +
                        "Pet: " + appointment.getPet().getName() + " (" + appointment.getPet().getSpecies() + ")\n" +
                        "Type: " + appointment.getAppointmentType() + "\n" +
                        "Doctor: " + appointment.getDoctor() + "\n" +
                        "Date: " + appointment.getDate() + "\n" +
                        "Time: " + appointment.getTimeSlot() + "\n" +
                        "Price: LKR " + appointment.getPrice()
        );
        send(message);
    }

    public void sendAppointmentUpdateEmail(String to, Appointment appointment) {
        if (!isMailAvailable()) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(to);
        message.setSubject("Appointment Updated - PetCareHub");
        message.setText(
                "Your appointment has been updated!\n\n" +
                        "Pet: " + appointment.getPet().getName() + " (" + appointment.getPet().getSpecies() + ")\n" +
                        "Type: " + appointment.getAppointmentType() + "\n" +
                        "Doctor: " + appointment.getDoctor() + "\n" +
                        "Date: " + appointment.getDate() + "\n" +
                        "Time: " + appointment.getTimeSlot() + "\n\n" +
                        "Please check your updated appointment details."
        );
        send(message);
    }

    public void sendAppointmentCancelEmail(String to, Appointment appointment) {
        if (!isMailAvailable()) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(to);
        message.setSubject("Appointment Cancelled - PetCareHub");
        message.setText(
                "Your appointment has been cancelled.\n\n" +
                        "Pet: " + appointment.getPet().getName() + " (" + appointment.getPet().getSpecies() + ")\n" +
                        "Type: " + appointment.getAppointmentType() + "\n" +
                        "Doctor: " + appointment.getDoctor() + "\n" +
                        "Date: " + appointment.getDate() + "\n" +
                        "Time: " + appointment.getTimeSlot() + "\n\n" +
                        "If this was a mistake, please rebook your appointment."
        );
        send(message);
    }

    public void sendPaymentConfirmationEmail(String to, Appointment appointment, Double amount) {
        if (!isMailAvailable()) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(to);
        message.setSubject("Payment Successful - PetCareHub");
        message.setText(
                "Your appointment payment was successful.\n\n" +
                        "Pet: " + appointment.getPet().getName() + " (" + appointment.getPet().getSpecies() + ")\n" +
                        "Type: " + appointment.getAppointmentType() + "\n" +
                        "Doctor: " + appointment.getDoctor() + "\n" +
                        "Date: " + appointment.getDate() + "\n" +
                        "Time: " + appointment.getTimeSlot() + "\n" +
                        "Amount Paid: LKR " + amount + "\n\n" +
                        "Thank you for choosing PetCareHub."
        );
        send(message);
    }

    public void sendOrderPaymentConfirmationEmail(String to, CustomerOrder order, Double amount) {
        if (!isMailAvailable()) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(to);
        message.setSubject("Order Payment Successful - PetCareHub");
        message.setText(
                "Your product order payment was successful.\n\n" +
                        "Order Number: " + order.getOrderNumber() + "\n" +
                        "Pickup Date: " + order.getPickupDate() + "\n" +
                        "Amount Paid: LKR " + amount + "\n\n" +
                        "Thank you for your purchase from PetCareHub."
        );
        send(message);
    }

    public void sendSimpleMessage(MailBody mailBody) {
        if (!isMailAvailable()) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(mailBody.to());
        message.setFrom(senderEmail);
        message.setSubject(mailBody.subject());
        message.setText(mailBody.text());
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
        log.info("Email sent successfully to {}", String.join(",", message.getTo()));
    } catch (Exception ex) {
        log.error("Failed to send email to {}: {}", message.getTo(), ex.getMessage());
    }
}
}