package com.petcarehub.petcarehub.repository;

import com.petcarehub.petcarehub.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Checks if a time slot is already booked for a given date and doctor
    boolean existsByDateAndDoctorAndTimeSlot(String date, String doctor, String timeSlot);

    // Returns all appointments on a specific date
    List<Appointment> findByDate(String date);

     
    // Finds all appointments where the user or owner matches the given userId
    @Query("SELECT a FROM Appointment a WHERE " +
           "(a.user IS NOT NULL AND a.user.userId = :userId) OR " +
           "(a.owner IS NOT NULL AND a.owner.userId = :userId)")
    List<Appointment> findByOwnerUserId(@Param("userId") Long userId);

    // Returns all appointments assigned to a specific vet
    List<Appointment> findByVet_UserId(Long vetId);
}