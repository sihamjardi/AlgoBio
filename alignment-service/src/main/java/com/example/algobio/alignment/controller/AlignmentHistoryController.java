package com.example.algobio.alignment.controller;

import com.example.algobio.alignment.entity.AlignmentResult;
import com.example.algobio.alignment.repository.AlignmentResultRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins="*")
@RestController
@RequestMapping("/api/alignment")
public class AlignmentHistoryController {

    private final AlignmentResultRepository repo;

    public AlignmentHistoryController(AlignmentResultRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/results")
    public List<AlignmentResult> results() {
        return repo.findTop200ByOrderByCreatedAtDesc();
    }
}
