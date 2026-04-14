package com.petcarehub.reminder.service.impl;

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
}
