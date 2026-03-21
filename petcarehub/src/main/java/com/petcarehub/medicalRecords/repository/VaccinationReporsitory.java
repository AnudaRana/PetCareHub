package com.petcarehub.medicalRecords.repository;

import com.petcarehub.medicalRecords.entity.Vaccination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VaccinationReporsitory extends JpaRepository<Vaccination, Long> {
    List<Vaccination> findByPetPetIdOrderByVaccinationDateDesc(Long petId);
}
