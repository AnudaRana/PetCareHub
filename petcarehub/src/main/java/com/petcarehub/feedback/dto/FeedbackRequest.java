package com.petcarehub.feedback.dto;

import lombok.Data;

@Data
public class FeedbackRequest {
    private Integer rating;
    private String comment;
    private Long appointmentId;
    private Long productId;
    private Long ownerId;
    private String feedbackType;
    private Boolean isVerified;
}
