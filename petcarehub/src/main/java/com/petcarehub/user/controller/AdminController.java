package com.petcarehub.user.controller;

import com.petcarehub.user.dto.UserResponse;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.service.UserService;
import com.petcarehub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final UserRepository userRepository;

    // Create a new staff or vet (Admin only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createStaffMember(@RequestBody User user) {
        // Enforce the admin role check strictly
        UserResponse createdUser = userService.register(user);
        return ResponseEntity.ok(createdUser);
    }

    // Get all users (Admin only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userRepository.findAll()
                .stream()
                .map(userService::toUserResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
