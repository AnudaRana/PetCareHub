package com.petcarehub.petcarehub.service;

import com.petcarehub.petcarehub.dto.AppointmentRequest;
import com.petcarehub.petcarehub.dto.AppointmentResponse;
import com.petcarehub.petcarehub.entity.Appointment;
import com.petcarehub.petcarehub.entity.Pet;
import com.petcarehub.petcarehub.entity.User;
import com.petcarehub.petcarehub.repository.AppointmentRepository;
import com.petcarehub.petcarehub.repository.PetRepository;
import com.petcarehub.petcarehub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AppointmentService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentService.class);

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final PetRepository petRepository;

    // Injects all required dependencies via constructor
    public AppointmentService(AppointmentRepository appointmentRepository,
                              EmailService emailService,
                              UserRepository userRepository,
                              PetRepository petRepository) {
        this.appointmentRepository = appointmentRepository;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.petRepository = petRepository;
    }

    // Creates and saves a new appointment; sends confirmation email to the owner
    public Appointment createAppointment(AppointmentRequest request) {
        if (appointmentRepository.existsByDateAndDoctorAndTimeSlot(
                request.getDate(),
                request.getDoctor(),
                request.getTimeSlot()
        )) {
            throw new IllegalStateException("The selected time slot is already booked for this doctor.");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        User vet = userRepository.findById(request.getVetId())
                .orElseThrow(() -> new IllegalArgumentException("Vet not found"));

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        Appointment appointment = new Appointment();
        appointment.setUser(user);
        appointment.setOwner(user);
        appointment.setVet(vet);
        appointment.setPet(pet);
        appointment.setAppointmentType(request.getAppointmentType());
        appointment.setDoctor(request.getDoctor());
        appointment.setDate(request.getDate());
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setPrice(request.getPrice());
        appointment.setNotes(request.getNotes());
        appointment.setStatus("UPCOMING");
        appointment.setUpdated(false);

        Appointment saved = appointmentRepository.save(appointment);

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            emailService.sendAppointmentConfirmation(user.getEmail(), saved);
        }

        return saved;
    }

    // Updates an existing appointment's details; sends update email to the owner
    public Appointment updateAppointment(Long appointmentId, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        boolean isSlotChanged =
                !appointment.getDate().equals(request.getDate()) ||
                !appointment.getDoctor().equals(request.getDoctor()) ||
                !appointment.getTimeSlot().equals(request.getTimeSlot());

        if (isSlotChanged && appointmentRepository.existsByDateAndDoctorAndTimeSlot(
                request.getDate(),
                request.getDoctor(),
                request.getTimeSlot()
        )) {
            throw new IllegalStateException("The selected time slot is already booked for this doctor.");
        }

        User vet = userRepository.findById(request.getVetId())
                .orElseThrow(() -> new IllegalArgumentException("Vet not found"));

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        appointment.setVet(vet);
        appointment.setPet(pet);
        appointment.setAppointmentType(request.getAppointmentType());
        appointment.setDoctor(request.getDoctor());
        appointment.setDate(request.getDate());
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setPrice(request.getPrice());
        appointment.setNotes(request.getNotes());
        appointment.setStatus("UPCOMING");
        appointment.setUpdated(true);

        Appointment updated = appointmentRepository.save(appointment);

        User user = appointment.getUser();
        if (user != null && user.getEmail() != null && !user.getEmail().isBlank()) {
            emailService.sendAppointmentUpdateEmail(user.getEmail(), updated);
        }

        return updated;
    }

    // Cancels an appointment by the owner and notifies the vet via email
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

    // Cancels an appointment by the vet and notifies the owner via email
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

    // Marks an appointment as COMPLETED; only allowed when status is UPCOMING
    public AppointmentResponse completeAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        String currentStatus = appointment.getStatus();

        if ("CANCELLED".equalsIgnoreCase(currentStatus)) {
            throw new IllegalStateException("Cannot complete a cancelled appointment.");
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

    // Fetches all appointments and maps them to DTOs
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream().map(this::toDto).toList();
    }

    // Fetches all appointments for a specific owner by user ID
    public List<AppointmentResponse> getAppointmentsByUser(Long userId) {
        List<Appointment> results = appointmentRepository.findByOwnerUserId(userId);
        log.info("[getAppointmentsByUser] userId={} → {} appointment(s) found", userId, results.size());
        return results.stream().map(this::toDto).toList();
    }

    // ── Private mapper ───────────────────────────────────────────────────────

    // Maps an Appointment entity to a flat AppointmentResponse DTO
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

        // owner: prefer the dedicated owner field, fall back to user
        com.petcarehub.petcarehub.entity.User owner =
                a.getOwner() != null ? a.getOwner() : a.getUser();
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

        return dto;
    }

    // Fetches all appointments assigned to a specific vet
    public List<Appointment> getAppointmentsByVet(Long vetId) {
        return appointmentRepository.findByVet_UserId(vetId);
    }

    // Returns non-cancelled booked time slots and doctors for a given date
    public List<Map<String, String>> getBookedSlots(String date) {
        return appointmentRepository.findByDate(date)
                .stream()
                .filter(a -> !"CANCELLED".equalsIgnoreCase(a.getStatus()))
                .map(a -> Map.of("timeSlot", a.getTimeSlot(), "doctor", a.getDoctor()))
                .toList();
    }
}