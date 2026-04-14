package com.petcarehub.reminder.service;

import com.petcarehub.reminder.dto.ReminderResponseDTO;

import java.util.List;

public interface ReminderService {
    List<ReminderResponseDTO> getRemindersForUser(Long userId);
}
