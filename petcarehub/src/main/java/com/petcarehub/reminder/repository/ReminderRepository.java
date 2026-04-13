package com.petcarehub.reminder.repository;

import com.petcarehub.reminder.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUser_UserIdOrderByDueDateAsc(Long userId);
}
