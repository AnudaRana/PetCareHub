package com.petcarehub.appointment.repository;

import com.petcarehub.appointment.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Legacy name-based check
    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.date = :date AND a.doctor = :doctor AND a.timeSlot = :timeSlot AND a.status NOT IN ('CANCELLED', 'EXPIRED')")
    boolean existsByDateAndDoctorAndTimeSlot(@Param("date") String date, @Param("doctor") String doctor, @Param("timeSlot") String timeSlot);

    // Relational duplicate check using vetId — excludes cancelled/expired appointments
    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.date = :date AND a.vet.userId = :vetId AND a.timeSlot = :timeSlot AND a.status NOT IN ('CANCELLED', 'EXPIRED')")
    boolean existsByDateAndVet_UserIdAndTimeSlot(@Param("date") String date, @Param("vetId") Long vetId, @Param("timeSlot") String timeSlot);

    // Find appointments that have been stuck in AWAITING_PAYMENT too long
    List<com.petcarehub.appointment.entity.Appointment> findByStatusAndCreatedAtBefore(String status, java.time.LocalDateTime threshold);

    // Delete by status and threshold
    void deleteByStatusAndCreatedAtBefore(String status, java.time.LocalDateTime threshold);

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
