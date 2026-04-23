package com.petcarehub.reminder.service;

import com.petcarehub.reminder.dto.ReminderRequestDTO;
import com.petcarehub.reminder.dto.ReminderResponseDTO;

import java.util.List;

public interface ReminderService {
    List<ReminderResponseDTO> getRemindersForUser(Long userId);
    ReminderResponseDTO getReminderById(Long reminderId);
    ReminderResponseDTO updateReminder(Long reminderId, ReminderRequestDTO requestDTO);
}
