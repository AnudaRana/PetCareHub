package com.petcarehub.appointment;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendAppointmentConfirmation(String to, Appointment appointment) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("prasannapradeepkumara90@gmail.com");
        message.setTo(to);
        message.setSubject("Appointment Confirmation - PetCareHub");

        message.setText(
                "Your appointment is confirmed!\n\n" +
                "Pet: " + appointment.getPetType() + "\n" +
                "Type: " + appointment.getAppointmentType() + "\n" +
                "Doctor: " + appointment.getDoctor() + "\n" +
                "Date: " + appointment.getDate() + "\n" +
                "Time: " + appointment.getTimeSlot() + "\n" +
                "Price: " + appointment.getPrice()
        );

        mailSender.send(message);
    }
}
