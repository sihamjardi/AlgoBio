package com.example.algobio.mutation.client;

import com.example.algobio.mutation.client.dto.SequenceDto;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class SequenceClient {
    private final RestTemplate restTemplate;

    public SequenceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public SequenceDto getById(Long id) {
        return restTemplate.getForObject(
                "http://SEQUENCE-SERVICE/api/sequences/" + id,
                SequenceDto.class
        );
    }
}
