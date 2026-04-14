package com.petcarehub.appointment.controller;

import com.petcarehub.appointment.dto.DoctorTimeSlotRequest;
import com.petcarehub.appointment.dto.DoctorTimeSlotResponse;
import com.petcarehub.appointment.service.DoctorTimeSlotService;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller that exposes time-slot management endpoints for veterinarians.
 *
 * Public endpoint:
 *   GET  /api/doctor-slots/vet/{vetId}   – anyone (authenticated) can fetch slots for a given vet
 *
 * Vet-only endpoints (resolve logged-in vet from JWT):
 *   GET    /api/doctor-slots/mine        – fetch the calling vet's own slots
 *   POST   /api/doctor-slots             – add a new slot
 *   PUT    /api/doctor-slots/{id}        – update an existing slot
 *   DELETE /api/doctor-slots/{id}        – delete a slot
 */
@RestController
@RequestMapping("/api/doctor-slots")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DoctorTimeSlotController {

    private final DoctorTimeSlotService slotService;
    private final UserRepository userRepository;

    // Injects service and user repository via constructor
    public DoctorTimeSlotController(DoctorTimeSlotService slotService,
                                    UserRepository userRepository) {
        this.slotService = slotService;
        this.userRepository = userRepository;
    }

    // Returns all time slots for a specific vet (used by the booking form)
    @GetMapping("/vet/{vetId}")
    public ResponseEntity<?> getSlotsByVet(@PathVariable Long vetId) {
        try {
            List<DoctorTimeSlotResponse> slots = slotService.getSlotsByVet(vetId);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Returns the calling vet's own time slots (used by the vet dashboard management page)
    @GetMapping("/mine")
    public ResponseEntity<?> getMySlots() {
        try {
            Long vetId = resolveCurrentVetId();
            List<DoctorTimeSlotResponse> slots = slotService.getSlotsByVet(vetId);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Creates a new time slot for the calling vet
    @PostMapping
    public ResponseEntity<?> addSlot(@RequestBody DoctorTimeSlotRequest request) {
        try {
            Long vetId = resolveCurrentVetId();
            DoctorTimeSlotResponse saved = slotService.addSlot(vetId, request);
            return ResponseEntity.ok(saved);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Updates an existing time slot owned by the calling vet
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSlot(@PathVariable Long id,
                                        @RequestBody DoctorTimeSlotRequest request) {
        try {
            Long vetId = resolveCurrentVetId();
            DoctorTimeSlotResponse updated = slotService.updateSlot(id, vetId, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Deletes a time slot owned by the calling vet
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id) {
        try {
            Long vetId = resolveCurrentVetId();
            slotService.deleteSlot(id, vetId);
            return ResponseEntity.ok(Map.of("message", "Time slot deleted successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // --- Helper ---

    // Resolves the authenticated user's DB ID from the JWT principal (email)
    private Long resolveCurrentVetId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("Not authenticated.");
        }
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found: " + email));
        return user.getUserId();
    }
}
