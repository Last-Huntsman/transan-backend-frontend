package com.transan.kafka;

import com.transan.config.KafkaTopicConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ForecastKafkaProducer {

    private final KafkaTemplate<String, byte[]> kafkaTemplate;
    private final KafkaTopicConfig topicConfig;

    public void send(String key, byte[] payload) {
        log.info("Sending forecast request with key={} to topic={}", key, topicConfig.getForecastInput());
        kafkaTemplate.send(topicConfig.getForecastInput(), key, payload);
    }
}
