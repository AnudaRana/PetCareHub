package com.petcarehub.appointment.repository;

import com.petcarehub.appointment.entity.DefaultTimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DefaultTimeSlotRepository extends JpaRepository<DefaultTimeSlot, Long> {
    Optional<DefaultTimeSlot> findByTimeSlot(String timeSlot);
}
