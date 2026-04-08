package com.petcarehub.user.controller;

import com.petcarehub.product.repository.ProductRepository;
import com.petcarehub.cart.repository.OrderRepository;
import com.petcarehub.user.dto.UserResponse;
import com.petcarehub.user.entity.Role;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import com.petcarehub.user.service.UserService;
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
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

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

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.Map<String, Long>> getStats() {
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalProducts", productRepository.count());
        stats.put("totalOrders", orderRepository.count());
        stats.put("vets", userRepository.findAll().stream().filter(u -> u.getRoles().contains(Role.ROLE_VET)).count());
        stats.put("staff", userRepository.findAll().stream().filter(u -> u.getRoles().contains(Role.ROLE_STAFF)).count());
        return ResponseEntity.ok(stats);
    }
}
