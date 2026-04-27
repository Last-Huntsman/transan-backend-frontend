package com.transan.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "spendings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Spending {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal sum;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "bank_category")
    private String bankCategory;

    @Column(name = "bank_description")
    private String bankDescription;

    @Column(nullable = false)
    @Builder.Default
    private String currency = "RUB";

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "category_description")
    private String categoryDescription;

    @Column
    private String comment;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
