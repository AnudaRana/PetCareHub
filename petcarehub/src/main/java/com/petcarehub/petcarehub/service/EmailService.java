package com.petcarehub.petcarehub.service;

import com.petcarehub.petcarehub.entity.Appointment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    // optional=true so the app starts even if mail config is incomplete
    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:no-reply@petcarehub.com}")
    private String senderEmail;

    // ---------------------------------------------------------------

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

    // ---------------------------------------------------------------

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