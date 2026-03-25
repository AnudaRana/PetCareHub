package com.petcarehub.petcarehub.repository;

import com.petcarehub.petcarehub.entity.MedicalTreatment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalTreatmentRepository extends JpaRepository<MedicalTreatment, Long> {
    List<MedicalTreatment> findByPetPetIdOrderByTreatmentDateDesc(Long petId);
}
