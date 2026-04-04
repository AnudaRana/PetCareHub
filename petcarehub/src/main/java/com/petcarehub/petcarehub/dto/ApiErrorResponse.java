package com.petcarehub.petcarehub.dto;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

public class ApiErrorResponse {
    public LocalDateTime timestamp = LocalDateTime.now();
    public int status;
    public String message;
    public Map<String, String> fieldErrors = new LinkedHashMap<>();
}
