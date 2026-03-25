 package com.petcarehub.petcarehub.service;

import com.petcarehub.petcarehub.dto.AppointmentRequest;
import com.petcarehub.petcarehub.entity.Appointment;
import com.petcarehub.petcarehub.entity.Pet;
import com.petcarehub.petcarehub.entity.User;
import com.petcarehub.petcarehub.repository.AppointmentRepository;
import com.petcarehub.petcarehub.repository.PetRepository;
import com.petcarehub.petcarehub.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final PetRepository petRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              EmailService emailService,
                              UserRepository userRepository,
                              PetRepository petRepository) {
        this.appointmentRepository = appointmentRepository;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.petRepository = petRepository;
    }

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

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        Appointment appointment = new Appointment();
        appointment.setUser(user);
        appointment.setPet(pet);
        appointment.setAppointmentType(request.getAppointmentType());
        appointment.setDoctor(request.getDoctor());
        appointment.setDate(request.getDate());
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setPrice(request.getPrice());
        appointment.setNotes(request.getNotes());
        appointment.setStatus("UPCOMING");

        Appointment saved = appointmentRepository.save(appointment);

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            emailService.sendAppointmentConfirmation(user.getEmail(), saved);
        }

        return saved;
    }

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

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        appointment.setPet(pet);
        appointment.setAppointmentType(request.getAppointmentType());
        appointment.setDoctor(request.getDoctor());
        appointment.setDate(request.getDate());
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setPrice(request.getPrice());
        appointment.setNotes(request.getNotes());
        appointment.setStatus("UPCOMING");

        Appointment updated = appointmentRepository.save(appointment);

        User user = appointment.getUser();
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            emailService.sendAppointmentUpdateEmail(user.getEmail(), updated);
        }

        return updated;
    }

    public Appointment cancelAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        appointment.setStatus("CANCELLED");
        Appointment cancelled = appointmentRepository.save(appointment);

        User user = appointment.getUser();
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            emailService.sendAppointmentCancelEmail(user.getEmail(), cancelled);
        }

        return cancelled;
    }

    public List<Appointment> getAppointmentsByUser(Long userId) {
        return appointmentRepository.findByUser_UserId(userId);
    }

    public List<Map<String, String>> getBookedSlots(String date) {
        return appointmentRepository.findByDate(date)
                .stream()
                .filter(a -> !"CANCELLED".equalsIgnoreCase(a.getStatus()))
                .map(a -> Map.of("timeSlot", a.getTimeSlot(), "doctor", a.getDoctor()))
                .toList();
    }
}