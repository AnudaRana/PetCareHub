package com.petcarehub.appointment;

import org.springframework.stereotype.Service;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              EmailService emailService) {
        this.appointmentRepository = appointmentRepository;
        this.emailService = emailService;
    }

    public Appointment createAppointment(Appointment appointment) {

        Appointment saved = appointmentRepository.save(appointment);

        // send email
        if (appointment.getUserEmail() != null && !appointment.getUserEmail().isBlank()) {
            emailService.sendAppointmentConfirmation(
                    appointment.getUserEmail(),
                    saved
            );
        }

        return saved;
    }
}
