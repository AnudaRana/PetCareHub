package com.petcarehub.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:no-reply@petcarehub.com}")
    private String senderEmail;

    public void sendEmail(String to, String subject, String body) {
        if (!isMailAvailable()) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        send(message);
    }

    public void sendVaccinationReminder(String to, String petName, String vaccinationName, LocalDate dueDate) {
        String subject = "Upcoming Vaccination Reminder - PetCareHub";
        String body = "Hello,\n\n" +
                "Your pet " + petName + " has a " + vaccinationName + " vaccination due on " + dueDate + ".\n" +
                "Please book a vaccination appointment with your veterinarian in advance.\n\n" +
                "Thank you,\n" +
                "PetCareHub Team";
        sendEmail(to, subject, body);
    }

    public void sendAppointmentReminder(String to, String petName, String appointmentType, String date, String timeSlot) {
        String subject = "Appointment Reminder - PetCareHub";
        String body = "Hello,\n\n" +
                "This is a reminder that you have an appointment scheduled for " + petName + " on " + date + " at " + timeSlot + ".\n" +
                "Appointment type: " + appointmentType + ".\n\n" +
                "Please arrive on time or contact us if you need to reschedule.\n\n" +
                "Thank you,\n" +
                "PetCareHub Team";
        sendEmail(to, subject, body);
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
