package com.petcarehub.appointment.service;

import com.petcarehub.appointment.dto.DoctorTimeSlotRequest;
import com.petcarehub.appointment.dto.DoctorTimeSlotResponse;
import com.petcarehub.appointment.entity.DoctorTimeSlot;
import com.petcarehub.appointment.repository.DoctorTimeSlotRepository;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorTimeSlotService {

    private final DoctorTimeSlotRepository slotRepository;
    private final UserRepository userRepository;

    // Injects required dependencies via constructor
    public DoctorTimeSlotService(DoctorTimeSlotRepository slotRepository,
                                 UserRepository userRepository) {
        this.slotRepository = slotRepository;
        this.userRepository = userRepository;
    }

    // Returns all time slots configured by the given vet ID
    public List<DoctorTimeSlotResponse> getSlotsByVet(Long vetId) {
        return slotRepository.findByVet_UserId(vetId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    // Adds a new time slot for a specific vet; throws if the slot already exists
    public DoctorTimeSlotResponse addSlot(Long vetId, DoctorTimeSlotRequest request) {
        if (request.getTimeSlot() == null || request.getTimeSlot().isBlank()) {
            throw new IllegalArgumentException("Time slot value is required.");
        }

        String normalised = request.getTimeSlot().trim();

        if (slotRepository.existsByVet_UserIdAndTimeSlot(vetId, normalised)) {
            throw new IllegalStateException("This time slot already exists for the selected doctor.");
        }

        User vet = userRepository.findById(vetId)
                .orElseThrow(() -> new IllegalArgumentException("Vet not found with ID: " + vetId));

        DoctorTimeSlot slot = new DoctorTimeSlot();
        slot.setVet(vet);
        slot.setTimeSlot(normalised);
        slot.setLabel(request.getLabel() != null ? request.getLabel().trim() : null);

        return toDto(slotRepository.save(slot));
    }

    // Updates an existing slot owned by vetId; throws if it doesn't belong to this vet or if the new
    // slot string already exists for the same vet
    public DoctorTimeSlotResponse updateSlot(Long id, Long vetId, DoctorTimeSlotRequest request) {
        if (request.getTimeSlot() == null || request.getTimeSlot().isBlank()) {
            throw new IllegalArgumentException("Time slot value is required.");
        }

        DoctorTimeSlot slot = slotRepository.findByIdAndVet_UserId(id, vetId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Time slot not found or does not belong to this vet."));

        String normalised = request.getTimeSlot().trim();

        // Only check duplicate if the time string actually changed
        if (!normalised.equals(slot.getTimeSlot())
                && slotRepository.existsByVet_UserIdAndTimeSlot(vetId, normalised)) {
            throw new IllegalStateException("This time slot already exists for the selected doctor.");
        }

        slot.setTimeSlot(normalised);
        slot.setLabel(request.getLabel() != null ? request.getLabel().trim() : null);

        return toDto(slotRepository.save(slot));
    }

    // Deletes a slot owned by vetId; throws if it doesn't belong to this vet
    public void deleteSlot(Long id, Long vetId) {
        DoctorTimeSlot slot = slotRepository.findByIdAndVet_UserId(id, vetId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Time slot not found or does not belong to this vet."));

        slotRepository.delete(slot);
    }

    // --- Private mapper ---

    // Maps a DoctorTimeSlot entity to its response DTO
    private DoctorTimeSlotResponse toDto(DoctorTimeSlot slot) {
        DoctorTimeSlotResponse dto = new DoctorTimeSlotResponse();
        dto.setId(slot.getId());
        dto.setTimeSlot(slot.getTimeSlot());
        dto.setLabel(slot.getLabel());

        if (slot.getVet() != null) {
            dto.setVetId(slot.getVet().getUserId());
            dto.setVetName(slot.getVet().getFirstName() + " " + slot.getVet().getLastName());
        }

        return dto;
    }
}
