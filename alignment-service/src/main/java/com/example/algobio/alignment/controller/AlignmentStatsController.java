package com.example.algobio.alignment.controller;

import com.example.algobio.alignment.repository.AlignmentResultRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins="*")
@RestController
@RequestMapping("/api/alignment")
public class AlignmentStatsController {

    private final AlignmentResultRepository repo;

    public AlignmentStatsController(AlignmentResultRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/stats")
    public Map<String, Long> stats() {
        return Map.of("alignments", repo.count());
    }

    @GetMapping("/stats/weekly")
    public List<Map<String, Object>> weekly() {
        return repo.countByWeekOfMonth().stream()
                .map(r -> Map.<String, Object>of(
                        "week", r[0].toString(),
                        "alignments", ((Number) r[1]).longValue()
                ))
                .toList();
    }
}
