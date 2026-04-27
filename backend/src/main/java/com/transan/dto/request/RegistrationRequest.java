package com.transan.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegistrationRequest {

    @NotBlank
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;

    @JsonProperty("monthly_budget")
    private Long monthlyBudget = 0L;

    @JsonProperty("is_male")
    private Boolean isMale = true;
}
