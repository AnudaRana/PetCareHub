 package com.petcarehub.petcarehub.repository;

import com.petcarehub.petcarehub.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    boolean existsByDateAndDoctorAndTimeSlot(String date, String doctor, String timeSlot);

    List<Appointment> findByDate(String date);

    List<Appointment> findByUser_UserId(Long userId);

    List<Appointment> findByVet_UserId(Long vetId);
}