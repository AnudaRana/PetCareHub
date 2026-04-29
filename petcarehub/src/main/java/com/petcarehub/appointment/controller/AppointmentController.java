package com.petcarehub.appointment.controller;

import com.petcarehub.appointment.dto.AppointmentRequest;
import com.petcarehub.appointment.dto.AppointmentResponse;
import com.petcarehub.appointment.entity.Appointment;
import com.petcarehub.appointment.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class AppointmentController {

    private final AppointmentService appointmentService;

    // Injects the AppointmentService dependency via constructor
    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    // Creates a new appointment from the request body
    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody AppointmentRequest request) {
        try {
            Appointment saved = appointmentService.createAppointment(request);
            return ResponseEntity.ok(saved);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    // Updates an existing appointment by its ID
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(@PathVariable Long id, @RequestBody AppointmentRequest request) {
        try {
            Appointment updated = appointmentService.updateAppointment(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    // Cancels an appointment by ID with an optional reason (owner-initiated)
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String reason = body.get("reason");
            Appointment cancelled = appointmentService.cancelAppointment(id, reason);
            return ResponseEntity.ok(cancelled);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    // Hard deletes an appointment by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        try {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.ok(Map.of("message", "Appointment deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    // Returns all appointments in the system
    @GetMapping
    public ResponseEntity<?> getAllAppointments() {
        try {
            List<AppointmentResponse> appointments = appointmentService.getAllAppointments();
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    // Returns all appointments belonging to a specific user (owner)
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getAppointmentsByUser(@PathVariable Long userId) {
        try {
            List<AppointmentResponse> appointments = appointmentService.getAppointmentsByUser(userId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    // Returns booked time slots for a given date, optionally filtered by vetId
    @GetMapping("/booked-slots")
    public ResponseEntity<List<Map<String, String>>> getBookedSlots(
            @RequestParam String date,
            @RequestParam(required = false) Long vetId) {
        List<Map<String, String>> bookedSlots = appointmentService.getBookedSlots(date, vetId);
        return ResponseEntity.ok(bookedSlots);
    }

    // Returns all appointments assigned to a specific vet
    @GetMapping("/vet/{vetId}")
    public ResponseEntity<?> getAppointmentsByVet(@PathVariable Long vetId) {
        try {
            List<AppointmentResponse> appointments = appointmentService.getAppointmentsByVet(vetId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    // Cancels an appointment on behalf of a vet, with a reason
    @PatchMapping("/{id}/cancel-by-vet")
    public ResponseEntity<?> cancelByVet(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            Long vetId = Long.parseLong(body.get("vetId"));
            String reason = body.get("reason");

            Appointment cancelled = appointmentService.cancelAppointmentByVet(id, vetId, reason);
            return ResponseEntity.ok(cancelled);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Marks an appointment as COMPLETED; only allowed when current status is
    // UPCOMING
    @PatchMapping("/{id}/complete")
    public ResponseEntity<?> completeAppointment(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(appointmentService.completeAppointment(id));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    // Finalizes an appointment after successful payment verification
    @PostMapping("/{id}/confirm")
    public ResponseEntity<?> confirmPayment(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(appointmentService.confirmPayment(id));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }
}