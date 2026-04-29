package com.petcarehub.appointment.controller;

import com.petcarehub.appointment.entity.AppointmentType;
import com.petcarehub.appointment.repository.AppointmentTypeRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointment-types")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AppointmentTypeController {

    private final AppointmentTypeRepository repository;

    public AppointmentTypeController(AppointmentTypeRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void seedInitialTypes() {
        if (repository.count() == 0) {
            repository.save(new AppointmentType("Vaccination", 2500, true, "💉"));
            repository.save(new AppointmentType("Operation", 3000, true, "🔪"));
            System.out.println("Seeded default AppointmentTypes: Vaccination & Operation");
        }
    }

    @GetMapping
    public ResponseEntity<List<AppointmentType>> getAllTypes() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> addType(@RequestBody AppointmentType newType) {
        if (repository.findByName(newType.getName()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Appointment Type already exists"));
        }
        return ResponseEntity.ok(repository.save(newType));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateType(@PathVariable Long id, @RequestBody AppointmentType updated) {
        return repository.findById(id).map(type -> {
            type.setName(updated.getName());
            type.setPrice(updated.getPrice());
            type.setRequiresVet(updated.isRequiresVet());
            type.setIcon(updated.getIcon());
            return ResponseEntity.ok(repository.save(type));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteType(@PathVariable Long id) {
        return repository.findById(id).map(type -> {
            repository.delete(type);
            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
