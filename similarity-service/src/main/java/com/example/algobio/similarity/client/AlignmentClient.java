package com.example.algobio.similarity.client;

import com.example.algobio.similarity.client.dto.AlignmentRequest;
import com.example.algobio.similarity.client.dto.AlignmentResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class AlignmentClient {
    private final RestTemplate restTemplate;

    public AlignmentClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public AlignmentResponse align(AlignmentRequest req) {
        return restTemplate.postForObject(
                "http://ALIGNMENT-SERVICE/api/alignment",
                req,
                AlignmentResponse.class
        );
    }
}
