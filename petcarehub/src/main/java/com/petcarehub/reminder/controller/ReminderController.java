package com.petcarehub.reminder.controller;

import com.petcarehub.reminder.dto.ReminderResponseDTO;
import com.petcarehub.reminder.service.ReminderService;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ReminderController {

    private final ReminderService reminderService;
    private final UserService userService;

    public ReminderController(ReminderService reminderService, UserService userService) {
        this.reminderService = reminderService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<ReminderResponseDTO>> getReminders(@RequestParam(value = "userId", required = false) Long userId) {
        Long effectiveUserId = userId;

        if (effectiveUserId == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.badRequest().build();
            }
            User currentUser = userService.getUserByEmail(authentication.getName());
            effectiveUserId = currentUser.getUserId();
        }

        return ResponseEntity.ok(reminderService.getRemindersForUser(effectiveUserId));
    }
}
