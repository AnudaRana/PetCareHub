package com.petcarehub.appointment.repository;

import com.petcarehub.appointment.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Legacy name-based check — kept for backward compatibility with update flow
    boolean existsByDateAndDoctorAndTimeSlot(String date, String doctor, String timeSlot);

    // Relational duplicate check using vetId (used for new appointment creation)
    boolean existsByDateAndVet_UserIdAndTimeSlot(String date, Long vetId, String timeSlot);

    // Fetch all appointments for a date (global)
    List<Appointment> findByDate(String date);

    // Fetch appointments for a specific vet on a date (for per-vet booked slot filtering)
    List<Appointment> findByDateAndVet_UserId(String date, Long vetId);

    /**
     * Find appointments for an owner.
     *
     * Uses OR to cover two scenarios:
     *  - New appointments: both user_id and owner_id are populated.
     *  - Old appointments (created before user_id column existed): only owner_id
     *    is set; user_id is NULL.
     *
     * The vet query (findByVet_UserId) is unchanged and continues to work normally.
     */
    @Query("SELECT a FROM Appointment a WHERE " +
           "(a.user IS NOT NULL AND a.user.userId = :userId) OR " +
           "(a.owner IS NOT NULL AND a.owner.userId = :userId)")
    List<Appointment> findByOwnerUserId(@Param("userId") Long userId);

    List<Appointment> findByVet_UserId(Long vetId);
}