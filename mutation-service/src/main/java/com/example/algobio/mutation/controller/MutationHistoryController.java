package com.example.algobio.mutation.controller;

import com.example.algobio.mutation.dto.MutationSimulationRowDto;
import com.example.algobio.mutation.dto.MutationVariantRowDto;
import com.example.algobio.mutation.entity.MutationSimulation;
import com.example.algobio.mutation.entity.MutationVariant;
import com.example.algobio.mutation.repository.MutationSimulationRepository;
import com.example.algobio.mutation.repository.MutationVariantRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins="*")
@RestController
@RequestMapping("/api/mutations")
public class MutationHistoryController {

    private final MutationSimulationRepository simRepo;
    private final MutationVariantRepository varRepo;

    public MutationHistoryController(MutationSimulationRepository simRepo, MutationVariantRepository varRepo) {
        this.simRepo = simRepo;
        this.varRepo = varRepo;
    }

    // Liste des simulations
    @GetMapping("/simulations")
    public List<MutationSimulationRowDto> listSimulations() {
        return simRepo.findAll().stream()
                .sorted((a,b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(s -> new MutationSimulationRowDto(
                        s.getId(),
                        s.getMutationType(),
                        s.getMutationRate(),
                        s.getVariantsCount(),
                        s.getAlignmentAlgorithm(),
                        s.getCreatedAt(),
                        s.getOriginalSequence() == null ? 0 : s.getOriginalSequence().length()
                ))
                .toList();
    }

    @GetMapping("/simulations/{id}/variants")
    public List<MutationVariantRowDto> listVariants(@PathVariable Long id) {
        List<MutationVariant> vars = varRepo.findBySimulationIdOrderByIdAsc(id);
        return vars.stream().map(v -> new MutationVariantRowDto(
                v.getId(),
                v.getCreatedAt(),
                v.getMutatedSequence() == null ? 0 : v.getMutatedSequence().length(),
                v.getScore(),
                v.getIdentityPercent(),
                v.getMutatedSequence(),
                v.getAlignedOriginal(),
                v.getAlignedMutated()
        )).toList();
    }

    // (optionnel) récupérer une simulation unique
    @GetMapping("/simulations/{id}")
    public MutationSimulation getOne(@PathVariable Long id) {
        return simRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Simulation not found: " + id));
    }
}
