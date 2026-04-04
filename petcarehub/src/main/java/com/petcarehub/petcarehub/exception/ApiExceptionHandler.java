package com.petcarehub.petcarehub.exception;

import com.petcarehub.petcarehub.dto.ApiErrorResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        ApiErrorResponse response = new ApiErrorResponse();
        response.status = HttpStatus.BAD_REQUEST.value();
        response.message = "Please correct the highlighted fields and try again.";

        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            response.fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(EntityNotFoundException ex) {
        ApiErrorResponse response = new ApiErrorResponse();
        response.status = HttpStatus.NOT_FOUND.value();
        response.message = ex.getMessage();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<ApiErrorResponse> handleBadRequest(RuntimeException ex) {
        ApiErrorResponse response = new ApiErrorResponse();
        response.status = HttpStatus.BAD_REQUEST.value();
        response.message = ex.getMessage();
        return ResponseEntity.badRequest().body(response);
    }
}
