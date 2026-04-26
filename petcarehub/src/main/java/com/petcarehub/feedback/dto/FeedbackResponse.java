package com.petcarehub.feedback.dto;

import lombok.Data;

import java.util.Date;

@Data
public class FeedbackResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private Long ownerId;
    private String ownerName;
    private Long appointmentId;
    private String appointmentType;
    private String appointmentDoctor;
    private String appointmentDate;
    private Long productId;
    private String productName;
    private String staffReply;
    private Boolean isVerified;
    private String feedbackType;
    private Date createdDate;
}
