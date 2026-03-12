package com.transan.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ImportResponse {
    private int imported;
    private int failed;
    private List<ImportError> errors;

    @Data
    @AllArgsConstructor
    public static class ImportError {
        private int row;
        private String reason;
    }
}
