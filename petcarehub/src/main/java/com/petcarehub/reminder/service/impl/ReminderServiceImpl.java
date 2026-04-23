package com.petcarehub.reminder.service.impl;

import com.petcarehub.reminder.dto.ReminderRequestDTO;
import com.petcarehub.reminder.dto.ReminderResponseDTO;
import com.petcarehub.reminder.entity.Reminder;
import com.petcarehub.reminder.repository.ReminderRepository;
import com.petcarehub.reminder.service.ReminderService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReminderServiceImpl implements ReminderService {

    private final ReminderRepository reminderRepository;

    public ReminderServiceImpl(ReminderRepository reminderRepository) {
        this.reminderRepository = reminderRepository;
    }

    @Override
    public List<ReminderResponseDTO> getRemindersForUser(Long userId) {
        return reminderRepository.findByUser_UserIdOrderByDueDateAsc(userId)
                .stream()
                .map(ReminderResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public ReminderResponseDTO getReminderById(Long reminderId) {
        Reminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new IllegalArgumentException("Reminder not found with id: " + reminderId));
        return ReminderResponseDTO.fromEntity(reminder);
    }

    @Override
    public ReminderResponseDTO updateReminder(Long reminderId, ReminderRequestDTO requestDTO) {
        Reminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new IllegalArgumentException("Reminder not found with id: " + reminderId));

        if (requestDTO.getDescription() != null) {
            reminder.setDescription(requestDTO.getDescription());
        }
        if (requestDTO.getDueDate() != null) {
            reminder.setDueDate(requestDTO.getDueDate());
        }
        if (requestDTO.getStatus() != null) {
            reminder.setStatus(requestDTO.getStatus());
        }

        Reminder updatedReminder = reminderRepository.save(reminder);
        return ReminderResponseDTO.fromEntity(updatedReminder);
    }
}
