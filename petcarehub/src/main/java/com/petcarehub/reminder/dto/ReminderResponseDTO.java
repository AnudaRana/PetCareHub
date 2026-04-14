package com.petcarehub.reminder.dto;

import com.petcarehub.reminder.entity.Reminder;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReminderResponseDTO {

    private Long reminderId;
    private Long userId;
    private Long petId;
    private String petName;
    private String reminderType;
    private String description;
    private LocalDate dueDate;
    private String status;
    private LocalDateTime createdAt;

    public ReminderResponseDTO() {}

    public static ReminderResponseDTO fromEntity(Reminder reminder) {
        ReminderResponseDTO dto = new ReminderResponseDTO();
        dto.setReminderId(reminder.getReminderId());
        dto.setUserId(reminder.getUser().getUserId());
        dto.setPetId(reminder.getPet().getPetId());
        dto.setPetName(reminder.getPet().getName());
        dto.setReminderType(reminder.getReminderType());
        dto.setDescription(reminder.getDescription());
        dto.setDueDate(reminder.getDueDate());
        dto.setStatus(reminder.getStatus());
        dto.setCreatedAt(reminder.getCreatedAt());
        return dto;
    }

    public Long getReminderId() {
        return reminderId;
    }

    public void setReminderId(Long reminderId) {
        this.reminderId = reminderId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getPetId() {
        return petId;
    }

    public void setPetId(Long petId) {
        this.petId = petId;
    }

    public String getPetName() {
        return petName;
    }

    public void setPetName(String petName) {
        this.petName = petName;
    }

    public String getReminderType() {
        return reminderType;
    }

    public void setReminderType(String reminderType) {
        this.reminderType = reminderType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
