package com.petcarehub.medical.repository;

import com.petcarehub.medical.entity.MedicalTreatment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalTreatmentRepository extends JpaRepository<MedicalTreatment, Long> {
    List<MedicalTreatment> findByPetPetIdOrderByTreatmentDateDesc(Long petId);
}
