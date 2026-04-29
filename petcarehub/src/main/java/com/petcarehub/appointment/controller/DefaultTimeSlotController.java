package com.petcarehub.appointment.controller;

import com.petcarehub.appointment.entity.DefaultTimeSlot;
import com.petcarehub.appointment.repository.DefaultTimeSlotRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/default-time-slots")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DefaultTimeSlotController {

    private final DefaultTimeSlotRepository repository;

    public DefaultTimeSlotController(DefaultTimeSlotRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void seedInitialSlots() {
        if (repository.count() == 0) {
            repository.save(new DefaultTimeSlot("09:00 AM", "Operation Slot 1"));
            repository.save(new DefaultTimeSlot("10:00 AM", "Operation Slot 2"));
            repository.save(new DefaultTimeSlot("11:00 AM", "Operation Slot 3"));
            repository.save(new DefaultTimeSlot("12:00 PM", "Vaccination Slot 1"));
            repository.save(new DefaultTimeSlot("12:15 PM", "Vaccination Slot 2"));
            repository.save(new DefaultTimeSlot("12:30 PM", "Vaccination Slot 3"));
            repository.save(new DefaultTimeSlot("12:45 PM", "Vaccination Slot 4"));
            System.out.println("Seeded Default Time Slots.");
        }
    }

    @GetMapping
    public ResponseEntity<List<DefaultTimeSlot>> getAllSlots() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> addSlot(@RequestBody DefaultTimeSlot newSlot) {
        if (repository.findByTimeSlot(newSlot.getTimeSlot()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Time slot already exists"));
        }
        return ResponseEntity.ok(repository.save(newSlot));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSlot(@PathVariable Long id, @RequestBody DefaultTimeSlot updated) {
        return repository.findById(id).map(slot -> {
            slot.setTimeSlot(updated.getTimeSlot());
            slot.setLabel(updated.getLabel());
            return ResponseEntity.ok(repository.save(slot));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id) {
        return repository.findById(id).map(slot -> {
            repository.delete(slot);
            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
