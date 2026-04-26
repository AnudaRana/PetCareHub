package com.petcarehub.feedback.controller;

import com.petcarehub.feedback.dto.FeedbackRequest;
import com.petcarehub.feedback.dto.FeedbackResponse;
import com.petcarehub.feedback.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> submitFeedback(@RequestBody FeedbackRequest request) {
        try {
            FeedbackResponse response = feedbackService.submitFeedback(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<FeedbackResponse>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<FeedbackResponse>> getFeedbackByAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByAppointment(appointmentId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<FeedbackResponse> getFeedbackById(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.getFeedbackById(id));
    }

    @PostMapping("/{id}/reply")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<FeedbackResponse> addStaffReply(@PathVariable Long id, @RequestBody String reply) {
        // Remove quotes if passed as JSON string
        if (reply.startsWith("\"") && reply.endsWith("\"")) {
            reply = reply.substring(1, reply.length() - 1);
        }
        return ResponseEntity.ok(feedbackService.addStaffReply(id, reply));
    }

    @GetMapping("/public")
    public ResponseEntity<List<FeedbackResponse>> getPublicFeedbacks() {
        return ResponseEntity.ok(feedbackService.getPublicFeedbacks());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<FeedbackResponse>> getFeedbacksByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(feedbackService.getFeedbacksByProduct(productId));
    }
}
