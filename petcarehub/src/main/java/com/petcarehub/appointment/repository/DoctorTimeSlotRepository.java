package com.petcarehub.appointment.repository;

import com.petcarehub.appointment.entity.DoctorTimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorTimeSlotRepository extends JpaRepository<DoctorTimeSlot, Long> {

    // Fetch all time slots configured by a specific vet
    List<DoctorTimeSlot> findByVet_UserId(Long vetId);

    // Duplicate-prevention check: returns true if the vet already has this time slot
    boolean existsByVet_UserIdAndTimeSlot(Long vetId, String timeSlot);

    // Used during update to find the existing record for edit (excluding itself from dup check)
    Optional<DoctorTimeSlot> findByIdAndVet_UserId(Long id, Long vetId);
}
