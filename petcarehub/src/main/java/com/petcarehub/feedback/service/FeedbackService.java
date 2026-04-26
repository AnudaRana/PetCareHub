package com.petcarehub.feedback.service;

import com.petcarehub.appointment.entity.Appointment;
import com.petcarehub.appointment.repository.AppointmentRepository;
import com.petcarehub.feedback.dto.FeedbackRequest;
import com.petcarehub.feedback.dto.FeedbackResponse;
import com.petcarehub.feedback.entity.Feedback;
import com.petcarehub.feedback.repository.FeedbackRepository;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import com.petcarehub.order.repository.ViewOrderItemRepository;
import com.petcarehub.product.entity.Product;
import com.petcarehub.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ViewOrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    public FeedbackResponse submitFeedback(FeedbackRequest request) {
        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        Feedback.FeedbackBuilder feedbackBuilder = Feedback.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .owner(owner)
                .feedbackType(request.getFeedbackType() != null ? request.getFeedbackType() : "GENERAL");

        if ("APPOINTMENT".equalsIgnoreCase(request.getFeedbackType()) && request.getAppointmentId() != null) {
            Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));

            if (!"COMPLETED".equalsIgnoreCase(appointment.getStatus())) {
                throw new RuntimeException("Feedback can only be submitted for completed appointments.");
            }

            List<Feedback> existingFeedbacks = feedbackRepository.findByAppointment_Id(appointment.getId());
            if (existingFeedbacks.size() >= 3) {
                throw new RuntimeException("Maximum of 3 feedbacks allowed per appointment.");
            }
            feedbackBuilder.appointment(appointment);
            feedbackBuilder.isVerified(true); // Automatically verify appointment reviews
        } else if ("PRODUCT".equalsIgnoreCase(request.getFeedbackType()) && request.getProductId() != null) {
            // Verify purchase
            boolean hasPurchased = orderItemRepository.hasPurchasedProduct(request.getOwnerId(), request.getProductId());
            if (!hasPurchased) {
                throw new RuntimeException("You must purchase the product before reviewing it.");
            }
            feedbackBuilder.productId(request.getProductId());
            feedbackBuilder.isVerified(true); // Automatically verify product reviews
        } else {
            feedbackBuilder.isVerified(false); // General reviews are not verified
        }

        Feedback savedFeedback = feedbackRepository.save(feedbackBuilder.build());
        return mapToResponse(savedFeedback);
    }

    public FeedbackResponse addStaffReply(Long feedbackId, String reply) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
        feedback.setStaffReply(reply);
        return mapToResponse(feedbackRepository.save(feedback));
    }

    public List<FeedbackResponse> getPublicFeedbacks() {
        return feedbackRepository.findAllByOrderByCreatedDateDesc()
                .stream()
                .filter(f -> !"PRODUCT".equalsIgnoreCase(f.getFeedbackType())) // Don't show product store reviews in public testimonials
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<FeedbackResponse> getFeedbacksByProduct(Long productId) {
        return feedbackRepository.findAllByOrderByCreatedDateDesc()
                .stream()
                .filter(f -> productId.equals(f.getProductId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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

    public FeedbackResponse getFeedbackById(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
        return mapToResponse(feedback);
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
        response.setStaffReply(feedback.getStaffReply());
        response.setIsVerified(feedback.getIsVerified());
        response.setFeedbackType(feedback.getFeedbackType());
        response.setProductId(feedback.getProductId());

        if (feedback.getProductId() != null) {
            productRepository.findById(feedback.getProductId()).ifPresent(p -> {
                response.setProductName(p.getName());
            });
        }
        return response;
    }
}
