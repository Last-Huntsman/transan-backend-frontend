package com.transan.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ForecastPageResponse {

    @JsonProperty("overall_comment")
    private String overallComment;

    private List<CategoryForecast> categories;
    private int page;
    private int size;

    @JsonProperty("total_elements")
    private long totalElements;

    @JsonProperty("total_pages")
    private int totalPages;

    @Data
    @Builder
    @AllArgsConstructor
    public static class CategoryForecast {

        @JsonProperty("category_name")
        private String categoryName;

        @JsonProperty("total_sum")
        private BigDecimal totalSum;

        private List<SpendingResponse> spendings;
    }
}
