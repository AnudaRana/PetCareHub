package com.petcarehub.medical.repository;

import com.petcarehub.medical.entity.VaccinationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VaccinationRecordRepository extends JpaRepository<VaccinationRecord, Long> {
    List<VaccinationRecord> findByPetPetIdOrderByVaccinationDateDesc(Long petId);
}
