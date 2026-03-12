package com.transan.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class SpendingResponse {
    private UUID id;
    private BigDecimal sum;
    private LocalDate date;

    @JsonProperty("bank_category")
    private String bankCategory;

    @JsonProperty("bank_description")
    private String bankDescription;

    private String currency;

    @JsonProperty("category_name")
    private String categoryName;

    @JsonProperty("category_description")
    private String categoryDescription;

    private String comment;

    @JsonProperty("created_at")
    private OffsetDateTime createdAt;

    @JsonProperty("updated_at")
    private OffsetDateTime updatedAt;
}
