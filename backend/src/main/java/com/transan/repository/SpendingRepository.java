package com.transan.repository;

import com.transan.entity.Spending;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpendingRepository extends JpaRepository<Spending, UUID> {

    Page<Spending> findByUserId(UUID userId, Pageable pageable);

    Optional<Spending> findByIdAndUserId(UUID id, UUID userId);

    List<Spending> findByUserIdAndDateBetween(UUID userId, LocalDate from, LocalDate to);
}
