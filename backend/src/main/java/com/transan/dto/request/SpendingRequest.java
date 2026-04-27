package com.transan.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SpendingRequest {

    @NotNull
    private BigDecimal sum;

    @NotNull
    private LocalDate date;

    @JsonProperty("bank_category")
    private String bankCategory;

    @JsonProperty("bank_description")
    private String bankDescription;

    private String currency = "RUB";

    @JsonProperty("category_name")
    private String categoryName;

    @JsonProperty("category_description")
    private String categoryDescription;

    private String comment;
}
