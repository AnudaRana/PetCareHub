package com.petcarehub.appointment.service;

import com.petcarehub.appointment.dto.AppointmentRequest;
import com.petcarehub.appointment.dto.AppointmentResponse;
import com.petcarehub.appointment.entity.Appointment;
import com.petcarehub.appointment.repository.AppointmentRepository;
import com.petcarehub.payment.enums.PaymentStatus;
import com.petcarehub.payment.service.PaymentService;
import com.petcarehub.pet.entity.Pet;
import com.petcarehub.pet.repository.PetRepository;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

import java.util.List;
import java.util.Map;

@Service
public class AppointmentService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentService.class);

    private final AppointmentRepository appointmentRepository;
    private final AppointmentEmailService emailService;
    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final PaymentService paymentService;

    public AppointmentService(AppointmentRepository appointmentRepository,
            AppointmentEmailService emailService,
            UserRepository userRepository,
            PetRepository petRepository,
            PaymentService paymentService) {
        this.appointmentRepository = appointmentRepository;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.paymentService = paymentService;
    }

    public Appointment createAppointment(AppointmentRequest request) {
        if (request.getVetId() == null) {
            throw new IllegalArgumentException("A doctor (vetId) must be selected to book an appointment.");
        }

        if (appointmentRepository.existsByDateAndVet_UserIdAndTimeSlot(
                request.getDate(),
                request.getVetId(),
                request.getTimeSlot())) {
            throw new IllegalStateException("The selected time slot is already booked for this doctor.");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        User vet = userRepository.findById(request.getVetId())
                .orElseThrow(() -> new IllegalArgumentException("Vet not found"));

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        String doctorName = vet.getFirstName() + " " + vet.getLastName();

        Appointment appointment = new Appointment();
        appointment.setUser(user);
        appointment.setOwner(user);
        appointment.setVet(vet);
        appointment.setPet(pet);
        appointment.setAppointmentType(request.getAppointmentType());
        appointment.setDoctor(doctorName);
        appointment.setDate(request.getDate());
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setPrice(request.getPrice());
        appointment.setNotes(request.getNotes());
        appointment.setStatus("AWAITING_PAYMENT");
        appointment.setUpdated(false);

        return appointmentRepository.save(appointment);
    }

    public Appointment updateAppointment(Long appointmentId, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        User vet = null;
        String doctorName = appointment.getDoctor();

        if (request.getVetId() != null) {
            vet = userRepository.findById(request.getVetId()).orElse(null);
            if (vet != null) {
                doctorName = vet.getFirstName() + " " + vet.getLastName();
            }
        }

        Long newVetId = (vet != null) ? vet.getUserId() : null;
        Long existingVetId = (appointment.getVet() != null) ? appointment.getVet().getUserId() : null;

        boolean isSlotChanged = !appointment.getDate().equals(request.getDate()) ||
                !java.util.Objects.equals(existingVetId, newVetId) ||
                !appointment.getTimeSlot().equals(request.getTimeSlot());

        if (isSlotChanged && newVetId != null && appointmentRepository.existsByDateAndVet_UserIdAndTimeSlot(
                request.getDate(), newVetId, request.getTimeSlot())) {
            throw new IllegalStateException("The selected time slot is already booked for this doctor.");
        }

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        appointment.setVet(vet);
        appointment.setPet(pet);
        appointment.setAppointmentType(request.getAppointmentType());
        appointment.setDoctor(doctorName);
        appointment.setDate(request.getDate());
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setPrice(request.getPrice());
        appointment.setNotes(request.getNotes());
        // Status remains unchanged during update unless logic dictates otherwise
        appointment.setUpdated(true);

        Appointment updated = appointmentRepository.save(appointment);

        User user = appointment.getUser();
        if (user != null && user.getEmail() != null && !user.getEmail().isBlank()) {
            emailService.sendAppointmentUpdateEmail(user.getEmail(), updated);
        }

        return updated;
    }

    public Appointment cancelAppointment(Long appointmentId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Cancellation reason is required");
        }

        appointment.setStatus("CANCELLED");
        appointment.setCancellationReason(reason);
        appointment.setCancelledBy("OWNER");

        Appointment cancelled = appointmentRepository.save(appointment);

        User vet = appointment.getVet();
        if (vet != null && vet.getEmail() != null && !vet.getEmail().isBlank()) {
            emailService.sendAppointmentCancelEmail(vet.getEmail(), cancelled);
        }

        return cancelled;
    }

    public Appointment cancelAppointmentByVet(Long appointmentId, Long vetId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (!appointment.getVet().getUserId().equals(vetId)) {
            throw new IllegalStateException("You can only cancel your own appointments");
        }

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Cancellation reason is required");
        }

        appointment.setStatus("CANCELLED");
        appointment.setCancellationReason(reason);
        appointment.setCancelledBy("VET");

        Appointment cancelled = appointmentRepository.save(appointment);

        User owner = appointment.getOwner();
        if (owner != null && owner.getEmail() != null && !owner.getEmail().isBlank()) {
            emailService.sendAppointmentCancelEmail(owner.getEmail(), cancelled);
        }

        return cancelled;
    }

    public void deleteAppointment(Long appointmentId) {
        if (appointmentRepository.existsById(appointmentId)) {
            appointmentRepository.deleteById(appointmentId);
            log.info("[deleteAppointment] Deleted appointmentId={}", appointmentId);
        } else {
            throw new IllegalArgumentException("Appointment not found");
        }
    }

    public AppointmentResponse completeAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        String currentStatus = appointment.getStatus();

        if ("CANCELLED".equalsIgnoreCase(currentStatus) || "EXPIRED".equalsIgnoreCase(currentStatus)) {
            throw new IllegalStateException("Cannot complete a cancelled or expired appointment.");
        }

        if ("COMPLETED".equalsIgnoreCase(currentStatus)) {
            throw new IllegalStateException("Appointment is already marked as completed.");
        }

        if (!"UPCOMING".equalsIgnoreCase(currentStatus)) {
            throw new IllegalStateException("Only UPCOMING appointments can be marked as completed.");
        }

        appointment.setStatus("COMPLETED");
        Appointment saved = appointmentRepository.save(appointment);
        return toDto(saved);
    }

    @Transactional
    public AppointmentResponse confirmPayment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (!"AWAITING_PAYMENT".equalsIgnoreCase(appointment.getStatus())) {
            throw new IllegalStateException("Appointment is not awaiting payment. Status: " + appointment.getStatus());
        }

        // Verify payment status with PaymentService
        if (!paymentService.isAppointmentPaid(appointmentId)) {
            throw new IllegalStateException("Payment verification failed. Appointment remains unconfirmed.");
        }

        appointment.setStatus("UPCOMING");
        Appointment confirmed = appointmentRepository.save(appointment);

        User user = confirmed.getUser();
        if (user != null && user.getEmail() != null && !user.getEmail().isBlank()) {
            emailService.sendAppointmentConfirmation(user.getEmail(), confirmed);
        }

        log.info("[confirmPayment] Appointment confirmed: {}", appointmentId);
        return toDto(confirmed);
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanupExpiredAppointments() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(15);
        List<Appointment> expired = appointmentRepository.findByStatusAndCreatedAtBefore("AWAITING_PAYMENT", threshold);

        if (!expired.isEmpty()) {
            log.info("[Scheduled Cleanup] Expiring {} appointments awaiting payment", expired.size());
            for (Appointment a : expired) {
                a.setStatus("EXPIRED");
                appointmentRepository.save(a);
            }
        }
    }

    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream().map(this::toDto).toList();
    }

    public List<AppointmentResponse> getAppointmentsByUser(Long userId) {
        List<Appointment> results = appointmentRepository.findByOwnerUserId(userId);
        log.info("[getAppointmentsByUser] userId={} → {} appointment(s) found", userId, results.size());
        return results.stream().map(this::toDto).toList();
    }

    private AppointmentResponse toDto(Appointment a) {
        AppointmentResponse dto = new AppointmentResponse();

        dto.setId(a.getId());
        dto.setAppointmentType(a.getAppointmentType());
        dto.setDoctor(a.getDoctor());
        dto.setDate(a.getDate());
        dto.setTimeSlot(a.getTimeSlot());
        dto.setPrice(a.getPrice());
        dto.setNotes(a.getNotes());
        dto.setStatus(a.getStatus());
        dto.setUpdated(a.isUpdated());
        dto.setCancellationReason(a.getCancellationReason());
        dto.setCancelledBy(a.getCancelledBy());

        if (a.getPet() != null) {
            dto.setPetId(a.getPet().getPetId());
            dto.setPetName(a.getPet().getName());
            dto.setPetSpecies(a.getPet().getSpecies());
        }

        User owner = a.getOwner() != null ? a.getOwner() : a.getUser();
        if (owner != null) {
            dto.setOwnerId(owner.getUserId());
            dto.setOwnerFirstName(owner.getFirstName());
            dto.setOwnerLastName(owner.getLastName());
        }

        if (a.getVet() != null) {
            dto.setVetId(a.getVet().getUserId());
            dto.setVetFirstName(a.getVet().getFirstName());
            dto.setVetLastName(a.getVet().getLastName());
        }

        try {
            boolean paid = paymentService.isAppointmentPaid(a.getId());
            PaymentStatus paymentStatus = paymentService.getAppointmentPaymentStatus(a.getId());

            dto.setPaid(paid);
            dto.setPaymentStatus(paymentStatus != null ? paymentStatus.name() : null);
        } catch (Exception e) {
            dto.setPaid(false);
            dto.setPaymentStatus(null);
            log.error("Payment lookup failed for appointment id {}", a.getId(), e);
        }

        return dto;
    }

    public List<AppointmentResponse> getAppointmentsByVet(Long vetId) {
        return appointmentRepository.findByVet_UserId(vetId).stream().map(this::toDto).toList();
    }

    public List<Map<String, String>> getBookedSlots(String date, Long vetId) {
        List<Appointment> appointments = (vetId != null)
                ? appointmentRepository.findByDateAndVet_UserId(date, vetId)
                : appointmentRepository.findByDate(date);

        return appointments.stream()
                .filter(a -> !"CANCELLED".equalsIgnoreCase(a.getStatus()) && !"EXPIRED".equalsIgnoreCase(a.getStatus()))
                .map(a -> {
                    java.util.Map<String, String> slot = new java.util.HashMap<>();
                    slot.put("timeSlot", a.getTimeSlot());
                    slot.put("doctor", a.getDoctor() != null ? a.getDoctor() : "");
                    if (a.getVet() != null) {
                        slot.put("vetId", String.valueOf(a.getVet().getUserId()));
                    }
                    return slot;
                })
                .toList();
    }
}