package com.transan.kafka;

import com.google.protobuf.InvalidProtocolBufferException;
import com.transan.pb.AnalysisProto;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class ForecastKafkaListener {

    private final ConcurrentHashMap<String, CompletableFuture<AnalysisProto.ForecastResponse>> pendingRequests =
            new ConcurrentHashMap<>();

    public CompletableFuture<AnalysisProto.ForecastResponse> registerRequest(String correlationId) {
        CompletableFuture<AnalysisProto.ForecastResponse> future = new CompletableFuture<>();
        pendingRequests.put(correlationId, future);
        return future;
    }

    public void removeRequest(String correlationId) {
        pendingRequests.remove(correlationId);
    }

    @KafkaListener(topics = "${kafka.topics.forecast-output}", groupId = "${spring.kafka.consumer.group-id}")
    public void onMessage(ConsumerRecord<String, byte[]> record) {
        try {
            AnalysisProto.ForecastResponse response =
                    AnalysisProto.ForecastResponse.parseFrom(record.value());
            String correlationId = response.getId();
            log.info("Received forecast response with correlationId={}", correlationId);

            CompletableFuture<AnalysisProto.ForecastResponse> future = pendingRequests.remove(correlationId);
            if (future != null) {
                future.complete(response);
            } else {
                log.warn("No pending request for correlationId={}", correlationId);
            }
        } catch (InvalidProtocolBufferException e) {
            log.error("Failed to deserialize ForecastResponse", e);
        }
    }
}
