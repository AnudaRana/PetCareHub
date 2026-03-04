package com.petcarehub.auth.dto;

import lombok.Data;
import java.util.List;

@Data
public class LoginResponse {
    private String token;
    private String email;
    private String firstName;
    private String lastName;
    private byte[] profilePicture;
    private List<String> roles;

    public LoginResponse(String token, String email, String firstName, String lastName, byte[] profilePicture,
            List<String> roles) {
        this.token = token;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.profilePicture = profilePicture;
        this.roles = roles;
    }
}