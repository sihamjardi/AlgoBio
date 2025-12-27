package com.example.algobio.similarity.controller;

import com.example.algobio.similarity.dto.SimilaritySearchRequest;
import com.example.algobio.similarity.dto.SimilaritySearchResponse;
import com.example.algobio.similarity.service.SimilarityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins="*")
@RestController
@RequestMapping("/api/similarity")
public class SimilarityController {

    private final SimilarityService service;

    public SimilarityController(SimilarityService service) {
        this.service = service;
    }

    @PostMapping("/search")
    public ResponseEntity<?> search(@Valid @RequestBody SimilaritySearchRequest req) {
        try {
            SimilaritySearchResponse res = service.search(req);
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
