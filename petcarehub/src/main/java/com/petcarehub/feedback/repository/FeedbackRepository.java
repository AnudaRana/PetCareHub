package com.petcarehub.feedback.repository;

import com.petcarehub.feedback.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findAllByOrderByCreatedDateDesc();
    List<Feedback> findByAppointment_Id(Long appointmentId);
}
