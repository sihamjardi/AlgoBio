package com.example.algobio.alignment.controller;
import com.example.algobio.alignment.dto.AlignmentRequest;
import com.example.algobio.alignment.dto.AlignmentResponse;
import com.example.algobio.alignment.service.AlignmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins="*")
@RestController
@RequestMapping("/api/alignment")
public class AlignmentController {

    private final AlignmentService service;

    public AlignmentController(AlignmentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> align(@Valid @RequestBody AlignmentRequest request) {
        try {
            return ResponseEntity.ok(
                    service.align(request.getSeq1(), request.getSeq2(), request.getAlgorithm())
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
