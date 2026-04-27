package com.transan.service;

import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.transan.dto.request.SpendingRequest;
import com.transan.dto.response.ImportResponse;
import com.transan.dto.response.SpendingPageResponse;
import com.transan.dto.response.SpendingResponse;
import com.transan.entity.Spending;
import com.transan.entity.User;
import com.transan.exception.ResourceNotFoundException;
import com.transan.mapper.SpendingMapper;
import com.transan.repository.SpendingRepository;
import com.transan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.Charset;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpendingService {

    private final SpendingRepository spendingRepository;
    private final UserRepository userRepository;
    private final SpendingMapper spendingMapper;

    private static final DateTimeFormatter SBER_DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");

    @Transactional(readOnly = true)
    public SpendingPageResponse findAll(UUID userId, Pageable pageable) {
        Page<Spending> page = spendingRepository.findByUserId(userId, pageable);
        List<SpendingResponse> content = spendingMapper.toResponseList(page.getContent());
        return new SpendingPageResponse(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public SpendingResponse findById(UUID spendingId, UUID userId) {
        Spending spending = spendingRepository.findByIdAndUserId(spendingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Spending not found"));
        return spendingMapper.toResponse(spending);
    }

    @Transactional
    public SpendingResponse create(UUID spendingId, SpendingRequest request, UUID userId) {
        if (spendingRepository.existsById(spendingId)) {
            Spending existing = spendingRepository.findByIdAndUserId(spendingId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Spending not found"));
            return spendingMapper.toResponse(existing);
        }

        User user = userRepository.getReferenceById(userId);
        Spending spending = spendingMapper.toEntity(request);
        spending.setId(spendingId);
        spending.setUser(user);

        spending = spendingRepository.save(spending);
        return spendingMapper.toResponse(spending);
    }

    @Transactional
    public SpendingResponse upsert(UUID spendingId, SpendingRequest request, UUID userId) {
        User user = userRepository.getReferenceById(userId);

        Spending spending = spendingRepository.findById(spendingId).orElse(null);
        if (spending != null) {
            if (!spending.getUser().getId().equals(userId)) {
                throw new ResourceNotFoundException("Spending not found");
            }
            spendingMapper.updateEntity(request, spending);
        } else {
            spending = spendingMapper.toEntity(request);
            spending.setId(spendingId);
            spending.setUser(user);
        }

        spending = spendingRepository.save(spending);
        return spendingMapper.toResponse(spending);
    }

    @Transactional
    public void delete(UUID spendingId, UUID userId) {
        Spending spending = spendingRepository.findByIdAndUserId(spendingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Spending not found"));
        spendingRepository.delete(spending);
    }

    @Transactional
    public ImportResponse importCsv(MultipartFile file, UUID userId) {
        User user = userRepository.getReferenceById(userId);
        List<Spending> toSave = new ArrayList<>();
        List<ImportResponse.ImportError> errors = new ArrayList<>();
        int rowNum = 0;

        try (CSVReader reader = new CSVReaderBuilder(
                new InputStreamReader(file.getInputStream(), Charset.forName("windows-1251")))
                .withCSVParser(new CSVParserBuilder().withSeparator(';').build())
                .build()) {

            String[] headers = reader.readNext();
            if (headers == null) {
                return ImportResponse.builder().imported(0).failed(0).errors(List.of()).build();
            }

            int idxDate = findColumn(headers, "Дата операции");
            int idxStatus = findColumn(headers, "Статус");
            int idxSum = findColumn(headers, "Сумма операции");
            int idxCurrency = findColumn(headers, "Валюта операции");
            int idxCategory = findColumn(headers, "Категория");
            int idxDescription = findColumn(headers, "Описание");
            int idxMcc = findColumn(headers, "MCC");

            String[] row;
            while ((row = reader.readNext()) != null) {
                rowNum++;
                try {
                    String status = row[idxStatus].trim();
                    if (!"OK".equals(status)) {
                        continue;
                    }

                    String sumStr = row[idxSum].trim().replace(",", ".").replace(" ", "");
                    BigDecimal sum = new BigDecimal(sumStr);

                    String dateStr = row[idxDate].trim();
                    LocalDate date = LocalDate.parse(dateStr, SBER_DATE_FORMAT);

                    Spending spending = Spending.builder()
                            .id(UUID.randomUUID())
                            .user(user)
                            .sum(sum)
                            .date(date)
                            .bankCategory(row[idxCategory].trim())
                            .bankDescription(row[idxDescription].trim())
                            .currency(row[idxCurrency].trim())
                            .categoryName(row[idxCategory].trim())
                            .comment(row[idxMcc].trim())
                            .build();

                    toSave.add(spending);
                } catch (Exception e) {
                    errors.add(new ImportResponse.ImportError(rowNum, e.getMessage()));
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse CSV", e);
            errors.add(new ImportResponse.ImportError(rowNum, "Failed to parse CSV: " + e.getMessage()));
        }

        spendingRepository.saveAll(toSave);

        return ImportResponse.builder()
                .imported(toSave.size())
                .failed(errors.size())
                .errors(errors)
                .build();
    }

    private int findColumn(String[] headers, String name) {
        for (int i = 0; i < headers.length; i++) {
            String cleaned = headers[i].trim().replace("\"", "").replace("﻿", "");
            if (cleaned.equals(name)) {
                return i;
            }
        }
        throw new IllegalArgumentException("Column not found: " + name);
    }
}
