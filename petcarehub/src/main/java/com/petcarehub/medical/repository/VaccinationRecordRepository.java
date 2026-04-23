package com.petcarehub.medical.repository;

import com.petcarehub.medical.entity.VaccinationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VaccinationRecordRepository extends JpaRepository<VaccinationRecord, Long> {
    List<VaccinationRecord> findByPetPetIdOrderByVaccinationDateDesc(Long petId);

    List<VaccinationRecord> findByDueDateBetweenAndReminderStatus(java.time.LocalDate start, java.time.LocalDate end, String status);

    List<VaccinationRecord> findByDueDateLessThanEqualAndReminderStatus(java.time.LocalDate endDate, String status);

    List<VaccinationRecord> findByPet_Owner_UserIdAndDueDateBetweenAndReminderStatus(Long userId, java.time.LocalDate startDate, java.time.LocalDate endDate, String status);

    List<VaccinationRecord> findByPet_Owner_UserIdAndDueDateLessThanEqualAndReminderStatus(Long userId, java.time.LocalDate endDate, String status);
}
