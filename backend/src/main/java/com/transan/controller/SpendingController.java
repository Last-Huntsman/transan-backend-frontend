package com.transan.controller;

import com.transan.dto.request.SpendingRequest;
import com.transan.dto.response.ForecastPageResponse;
import com.transan.dto.response.ImportResponse;
import com.transan.dto.response.SpendingPageResponse;
import com.transan.dto.response.SpendingResponse;
import com.transan.security.SecurityUtils;
import com.transan.service.ForecastService;
import com.transan.service.SpendingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/spendings")
@RequiredArgsConstructor
@Tag(name = "Spendings", description = "CRUD, CSV import, and forecast")
public class SpendingController {

    private final SpendingService spendingService;
    private final ForecastService forecastService;

    @GetMapping
    @Operation(summary = "Get all spendings (paginated)")
    public SpendingPageResponse getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "date,desc") String sort) {

        String[] sortParts = sort.split(",");
        Sort sortObj = sortParts.length > 1
                ? Sort.by(Sort.Direction.fromString(sortParts[1]), sortParts[0])
                : Sort.by(Sort.Direction.DESC, sortParts[0]);
        Pageable pageable = PageRequest.of(page, size, sortObj);

        return spendingService.findAll(SecurityUtils.getCurrentUserId(), pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get spending by ID")
    public SpendingResponse getById(@PathVariable UUID id) {
        return spendingService.findById(id, SecurityUtils.getCurrentUserId());
    }

    @PostMapping("")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create spending with given UUID (idempotent)")
    public SpendingResponse create( @Valid @RequestBody SpendingRequest request) {
        return spendingService.create(UUID.randomUUID(), request, SecurityUtils.getCurrentUserId());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update or create spending by UUID (upsert)")
    public SpendingResponse update(@PathVariable UUID id, @Valid @RequestBody SpendingRequest request) {
        return spendingService.upsert(id, request, SecurityUtils.getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete spending by ID")
    public void delete(@PathVariable UUID id) {
        spendingService.delete(id, SecurityUtils.getCurrentUserId());
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    @Operation(summary = "Import spendings from Sberbank CSV file")
    public ImportResponse importCsv(@RequestParam("file") MultipartFile file) {
        return spendingService.importCsv(file, SecurityUtils.getCurrentUserId());
    }

    @GetMapping("/forecast")
    @Operation(summary = "Get spending forecast for current month via Kafka")
    public ForecastPageResponse forecast(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return forecastService.getForecast(SecurityUtils.getCurrentUserId(), page, size);
    }
}
