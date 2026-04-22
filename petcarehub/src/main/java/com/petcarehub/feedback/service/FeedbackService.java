package com.petcarehub.feedback.service;

import com.petcarehub.appointment.entity.Appointment;
import com.petcarehub.appointment.repository.AppointmentRepository;
import com.petcarehub.feedback.dto.FeedbackRequest;
import com.petcarehub.feedback.dto.FeedbackResponse;
import com.petcarehub.feedback.entity.Feedback;
import com.petcarehub.feedback.repository.FeedbackRepository;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    public FeedbackResponse submitFeedback(FeedbackRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!"COMPLETED".equalsIgnoreCase(appointment.getStatus())) {
            throw new RuntimeException("Feedback can only be submitted for completed appointments.");
        }

        List<Feedback> existingFeedbacks = feedbackRepository.findByAppointment_Id(appointment.getId());
        if (existingFeedbacks.size() >= 3) {
            throw new RuntimeException("Maximum of 3 feedbacks allowed per appointment.");
        }

        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        Feedback feedback = Feedback.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .owner(owner)
                .appointment(appointment)
                .build();

        Feedback savedFeedback = feedbackRepository.save(feedback);
        return mapToResponse(savedFeedback);
    }

    public List<FeedbackResponse> getAllFeedbacks() {
        return feedbackRepository.findAllByOrderByCreatedDateDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<FeedbackResponse> getFeedbackByAppointment(Long appointmentId) {
        return feedbackRepository.findByAppointment_Id(appointmentId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private FeedbackResponse mapToResponse(Feedback feedback) {
        FeedbackResponse response = new FeedbackResponse();
        response.setId(feedback.getId());
        response.setRating(feedback.getRating());
        response.setComment(feedback.getComment());
        response.setOwnerId(feedback.getOwner().getUserId());
        response.setOwnerName(feedback.getOwner().getFirstName() + " " + feedback.getOwner().getLastName());
        
        Appointment appointment = feedback.getAppointment();
        if (appointment != null) {
            response.setAppointmentId(appointment.getId());
            response.setAppointmentType(appointment.getAppointmentType());
            response.setAppointmentDoctor(appointment.getDoctor());
            response.setAppointmentDate(appointment.getDate() + " " + appointment.getTimeSlot());
        }
        
        response.setCreatedDate(feedback.getCreatedDate());
        return response;
    }
}
