package com.petcarehub.user.controller;

import com.petcarehub.user.entity.Role;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/create-vet")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createVet(@RequestBody User user) {
        user.getRoles().add(Role.ROLE_VET);
        User saved = userService.registerUser(user);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/create-staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createStaff(@RequestBody User user) {
        user.getRoles().add(Role.ROLE_STAFF);
        User saved = userService.registerUser(user);
        return ResponseEntity.ok(saved);
    }
}