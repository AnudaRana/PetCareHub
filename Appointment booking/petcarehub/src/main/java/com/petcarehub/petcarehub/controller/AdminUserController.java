package com.petcarehub.petcarehub.controller;

import com.petcarehub.petcarehub.entity.User;
import com.petcarehub.petcarehub.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * GET /api/admin/users/search?name=email
     * Search users by email (email is used as the login identifier / sessionStorage
     * "username").
     */
    @GetMapping("/search")
    public List<Map<String, Object>> searchUsers(@RequestParam("name") String name) {
        List<User> users = userRepository.findByEmailContainingIgnoreCase(name);

        return users.stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("userId", user.getUserId());
            map.put("username", user.getEmail());
            map.put("firstName", user.getFirstName());
            map.put("lastName", user.getLastName());
            map.put("email", user.getEmail());
            map.put("roles", user.getRoles());
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * GET /api/admin/users/{id}
     * Fetch a single user's profile by userId.
     * Used by the Dashboard as a fallback when sessionStorage has no username yet.
     */
    @GetMapping("/{id}")
    public Map<String, Object> getUserById(@PathVariable("id") Long id) {
        return userRepository.findById(id).map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("userId", user.getUserId());
            map.put("firstName", user.getFirstName());
            map.put("lastName", user.getLastName());
            map.put("email", user.getEmail());
            map.put("roles", user.getRoles());   // <-- ADD THIS
            return map;
        }).orElse(new HashMap<>());
    }
}
