package com.petcarehub.reminder.dto;

import java.time.LocalDate;

public class ReminderRequestDTO {

    private String description;
    private LocalDate dueDate;
    private String status;

    public ReminderRequestDTO() {}

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
}
