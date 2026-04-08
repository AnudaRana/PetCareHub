package com.petcarehub.auth.dto;

import lombok.Data;

import java.util.List;

@Data
public class LoginResponse {
    private String token;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private byte[] profilePicture;
    private List<String> roles;

    public LoginResponse(String token, Long userId, String email, String firstName, String lastName, String fullName, byte[] profilePicture,
            List<String> roles) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.fullName = fullName;
        this.profilePicture = profilePicture;
        this.roles = roles;
    }
}
