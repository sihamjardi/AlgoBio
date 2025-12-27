package com.example.algobio.mutation.controller;

import com.example.algobio.mutation.dto.MutationSimulateRequest;
import com.example.algobio.mutation.dto.MutationSimulateResponse;
import com.example.algobio.mutation.service.MutationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins="*")
@RestController
@RequestMapping("/api/mutations")
public class MutationController {

    private final MutationService service;

    public MutationController(MutationService service) {
        this.service = service;
    }

    @PostMapping("/simulate")
    public ResponseEntity<?> simulate(@Valid @RequestBody MutationSimulateRequest req) {
        try {
            MutationSimulateResponse res = service.simulate(req);
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
