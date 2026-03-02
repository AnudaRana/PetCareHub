package com.petcarehub.auth.dto;

import lombok.Data;
import java.util.List;

@Data
public class LoginResponse {
    private String token;
    private String email;
    private List<String> roles;

    public LoginResponse(String token, String email, String fullName, List<String> roles) {
        this.token = token;
        this.email = email;
        this.roles = roles;
    }
}