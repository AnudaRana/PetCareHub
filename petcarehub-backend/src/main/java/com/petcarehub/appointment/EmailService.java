 package com.petcarehub.petcarehub.service;

import com.petcarehub.petcarehub.entity.Appointment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:prasannapradeepkumara90@gmail.com}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    
    public void sendAppointmentConfirmation(String to, Appointment appointment) {

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

        mailSender.send(message);
    }

    
    public void sendAppointmentUpdateEmail(String to, Appointment appointment) {

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

        mailSender.send(message);
    }

    
    public void sendAppointmentCancelEmail(String to, Appointment appointment) {

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

        mailSender.send(message);
    }
}