package com.petcarehub.user.controller;

import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import com.petcarehub.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.annotation.PostConstruct;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void convertDatabaseBlob() {
        try {
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN profile_picture LONGBLOB;");
            System.out.println("✅ Fixed 'profile_picture' schema to LONGBLOB.");
        } catch (Exception e) {
            System.out.println(
                    "⚠️ Could not modify profile_picture schema (probably already applied): " + e.getMessage());
        }
    }

    @PutMapping("/me/update")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> updates) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("firstName"))
            user.setFirstName(updates.get("firstName"));
        if (updates.containsKey("lastName"))
            user.setLastName(updates.get("lastName"));
        if (updates.containsKey("mobileNumber"))
            user.setMobileNumber(updates.get("mobileNumber"));
        if (updates.containsKey("address"))
            user.setAddress(updates.get("address"));

        // Handle optional password update
        if (updates.containsKey("password") && !updates.get("password").trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updates.get("password")));
        }

        userRepository.save(user);

        return ResponseEntity.ok(userService.toUserResponse(user));
    }

    @PostMapping("/me/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            if (!file.isEmpty()) {
                user.setProfilePicture(file.getBytes());
                userRepository.save(user);
            }
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to upload profile picture", e);
        }

        return ResponseEntity.ok(userService.toUserResponse(user));
    }

    @DeleteMapping("/me/profile-picture")
    public ResponseEntity<?> removeProfilePicture() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setProfilePicture(null);
        userRepository.save(user);

        return ResponseEntity.ok(userService.toUserResponse(user));
    }

    @GetMapping("/vets")
    public ResponseEntity<?> getAllVets() {
        try {
            var vets = userService.getAllVets();
            return ResponseEntity.ok(vets);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to fetch vets: " + e.getMessage()));
        }
    }

}