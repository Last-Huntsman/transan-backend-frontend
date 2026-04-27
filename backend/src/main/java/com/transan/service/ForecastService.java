package com.transan.service;

import com.transan.dto.response.ForecastPageResponse;
import com.transan.dto.response.SpendingResponse;
import com.transan.entity.Spending;
import com.transan.entity.User;
import com.transan.exception.ResourceNotFoundException;
import com.transan.kafka.ForecastKafkaListener;
import com.transan.kafka.ForecastKafkaProducer;
import com.transan.mapper.SpendingMapper;
import com.transan.pb.AnalysisProto;
import com.transan.repository.SpendingRepository;
import com.transan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ForecastService {

    private final SpendingRepository spendingRepository;
    private final UserRepository userRepository;
    private final ForecastKafkaProducer kafkaProducer;
    private final ForecastKafkaListener kafkaListener;
    private final SpendingMapper spendingMapper;

    @Value("${app.forecast.timeout-seconds}")
    private long forecastTimeoutSeconds;

    public ForecastPageResponse getForecast(UUID userId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDate now = LocalDate.now();
        LocalDate firstDay = now.withDayOfMonth(1);

        List<Spending> history = spendingRepository.findByUserIdAndDateBetween(userId, firstDay, now);

        String correlationId = UUID.randomUUID().toString();

        AnalysisProto.ForecastRequest request = buildProtoRequest(correlationId, user, history);

        CompletableFuture<AnalysisProto.ForecastResponse> future = kafkaListener.registerRequest(correlationId);

        kafkaProducer.send(correlationId, request.toByteArray());

        AnalysisProto.ForecastResponse response;
        try {
            response = future.get(forecastTimeoutSeconds, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            kafkaListener.removeRequest(correlationId);
            throw new ForecastTimeoutException();
        } catch (Exception e) {
            kafkaListener.removeRequest(correlationId);
            throw new RuntimeException("Forecast request failed", e);
        }

        return buildPageResponse(response, page, size);
    }

    private AnalysisProto.ForecastRequest buildProtoRequest(String correlationId, User user, List<Spending> history) {
        AnalysisProto.User protoUser = AnalysisProto.User.newBuilder()
                .setId(user.getId().toString())
                .setMonthlyBudget(user.getMonthlyBudget() != null ? user.getMonthlyBudget() : 0)
                .setIsMale(user.getIsMale() != null && user.getIsMale())
                .build();

        List<AnalysisProto.Spending> protoHistory = history.stream()
                .map(s -> AnalysisProto.Spending.newBuilder()
                        .setId(s.getId().toString())
                        .setSum(s.getSum().floatValue())
                        .setDate(s.getDate().toString())
                        .setBankCategory(s.getBankCategory() != null ? s.getBankCategory() : "")
                        .setBankDescription(s.getBankDescription() != null ? s.getBankDescription() : "")
                        .setCurrency(s.getCurrency() != null ? s.getCurrency() : "")
                        .setCategoryName(s.getCategoryName() != null ? s.getCategoryName() : "")
                        .setComment(s.getComment() != null ? s.getComment() : "")
                        .build())
                .toList();

        return AnalysisProto.ForecastRequest.newBuilder()
                .setId(correlationId)
                .setUser(protoUser)
                .addAllHistory(protoHistory)
                .build();
    }

    private ForecastPageResponse buildPageResponse(AnalysisProto.ForecastResponse response, int page, int size) {
        Map<String, List<AnalysisProto.Spending>> grouped = response.getSpendingsForecastedList().stream()
                .collect(Collectors.groupingBy(
                        s -> s.getCategoryName().isEmpty() ? "Другое" : s.getCategoryName(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<ForecastPageResponse.CategoryForecast> allCategories = grouped.entrySet().stream()
                .map(entry -> {
                    BigDecimal totalSum = entry.getValue().stream()
                            .map(s -> BigDecimal.valueOf(s.getSum()))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    List<SpendingResponse> spendings = entry.getValue().stream()
                            .map(this::protoToResponse)
                            .toList();

                    return ForecastPageResponse.CategoryForecast.builder()
                            .categoryName(entry.getKey())
                            .totalSum(totalSum)
                            .spendings(spendings)
                            .build();
                })
                .toList();

        int totalElements = allCategories.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int fromIndex = Math.min(page * size, totalElements);
        int toIndex = Math.min(fromIndex + size, totalElements);
        List<ForecastPageResponse.CategoryForecast> pageContent = allCategories.subList(fromIndex, toIndex);

        return ForecastPageResponse.builder()
                .overallComment(response.hasOverallComment() ? response.getOverallComment() : null)
                .categories(pageContent)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .build();
    }

    private SpendingResponse protoToResponse(AnalysisProto.Spending proto) {
        SpendingResponse resp = new SpendingResponse();
        resp.setId(parseUuidOrNull(proto.getId()));
        resp.setSum(BigDecimal.valueOf(proto.getSum()));
        resp.setDate(proto.getDate().isEmpty() ? null : LocalDate.parse(proto.getDate()));
        resp.setBankCategory(proto.getBankCategory().isEmpty() ? null : proto.getBankCategory());
        resp.setBankDescription(proto.getBankDescription().isEmpty() ? null : proto.getBankDescription());
        resp.setCurrency(proto.getCurrency().isEmpty() ? null : proto.getCurrency());
        resp.setCategoryName(proto.getCategoryName().isEmpty() ? null : proto.getCategoryName());
        resp.setComment(proto.getComment().isEmpty() ? null : proto.getComment());
        return resp;
    }

    private static UUID parseUuidOrNull(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }

    public static class ForecastTimeoutException extends RuntimeException {
        public ForecastTimeoutException() {
            super("Forecast service timeout");
        }
    }
}
