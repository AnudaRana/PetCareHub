package com.petcarehub.notification;

import com.petcarehub.appointment.entity.Appointment;
import com.petcarehub.appointment.repository.AppointmentRepository;
import com.petcarehub.medical.entity.VaccinationRecord;
import com.petcarehub.medical.repository.VaccinationRecordRepository;
import com.petcarehub.pet.entity.Pet;
import com.petcarehub.user.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReminderScheduler.class);

    private final AppointmentRepository appointmentRepository;
    private final VaccinationRecordRepository vaccinationRecordRepository;
    private final EmailService emailService;

    public ReminderScheduler(AppointmentRepository appointmentRepository,
            VaccinationRecordRepository vaccinationRecordRepository,
            EmailService emailService) {
        this.appointmentRepository = appointmentRepository;
        this.vaccinationRecordRepository = vaccinationRecordRepository;
        this.emailService = emailService;
    }

    @Scheduled(cron = "0 30 9 * * ?")
    @Transactional
    public void sendDailyReminders() {
        log.info("Running daily reminder scheduler...");
        sendVaccinationDueReminders();
        sendTomorrowAppointmentReminders();
    }

    private void sendVaccinationDueReminders() {
        LocalDate today = LocalDate.now();
        LocalDate sevenDays = today.plusDays(7);
        List<VaccinationRecord> dueVaccinations = vaccinationRecordRepository
                .findByDueDateBetweenAndReminderStatus(today, sevenDays, "PENDING");

        for (VaccinationRecord vaccination : dueVaccinations) {
            Pet pet = vaccination.getPet();
            if (pet == null || pet.getOwner() == null) {
                log.warn("Skipping vaccination reminder because pet or owner is missing for record {}",
                        vaccination.getId());
                continue;
            }

            User owner = pet.getOwner();
            if (owner.getEmail() == null || owner.getEmail().isBlank()) {
                log.warn("Skipping vaccination reminder because owner email is missing for owner {}",
                        owner.getUserId());
                continue;
            }

            emailService.sendVaccinationReminder(owner.getEmail(), pet.getName(), vaccination.getVaccinationName(),
                    vaccination.getDueDate());
            log.info("Sent vaccination reminder to {} for pet {} due on {}", owner.getEmail(), pet.getName(),
                    vaccination.getDueDate());

            vaccination.setReminderStatus("SENT");
            vaccinationRecordRepository.save(vaccination);
        }
    }

    private void sendTomorrowAppointmentReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Appointment> appointments = appointmentRepository.findByDate(tomorrow.toString());

        for (Appointment appointment : appointments) {
            String status = appointment.getStatus();
            if (status == null) {
                continue;
            }

            if ("CANCELLED".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
                continue;
            }

            User owner = appointment.getOwner() != null ? appointment.getOwner() : appointment.getUser();
            if (owner == null || owner.getEmail() == null || owner.getEmail().isBlank()) {
                log.warn("Skipping appointment reminder because owner email is missing for appointment {}",
                        appointment.getId());
                continue;
            }

            String petName = appointment.getPet() != null ? appointment.getPet().getName() : "your pet";
            emailService.sendAppointmentReminder(owner.getEmail(), petName, appointment.getAppointmentType(),
                    appointment.getDate(), appointment.getTimeSlot());
            log.info("Sent appointment reminder to {} for appointment {} on {}", owner.getEmail(), appointment.getId(),
                    appointment.getDate());
        }
    }
}
