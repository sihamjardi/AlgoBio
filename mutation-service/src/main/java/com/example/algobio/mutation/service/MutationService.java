package com.example.algobio.mutation.service;

import com.example.algobio.mutation.client.AlignmentClient;
import com.example.algobio.mutation.client.SequenceClient;
import com.example.algobio.mutation.client.dto.SequenceDto;
import com.example.algobio.mutation.dto.*;
import com.example.algobio.mutation.entity.MutationSimulation;
import com.example.algobio.mutation.entity.MutationVariant;
import com.example.algobio.mutation.repository.MutationSimulationRepository;
import com.example.algobio.mutation.repository.MutationVariantRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class MutationService {

    private final AlignmentClient alignmentClient;
    private final SequenceClient sequenceClient;
    private final MutationSimulationRepository simulationRepo;
    private final MutationVariantRepository variantRepo;

    private final SecureRandom rng = new SecureRandom();
    private static final char[] BASES = {'A','T','C','G'};

    public MutationService(
            AlignmentClient alignmentClient,
            SequenceClient sequenceClient,
            MutationSimulationRepository simulationRepo,
            MutationVariantRepository variantRepo
    ) {
        this.alignmentClient = alignmentClient;
        this.sequenceClient = sequenceClient;
        this.simulationRepo = simulationRepo;
        this.variantRepo = variantRepo;
    }

    public MutationSimulateResponse simulate(MutationSimulateRequest req) {

        // 1) récupérer la séquence source
        String original;
        if (req.getSequenceId() != null) {
            SequenceDto s = sequenceClient.getById(req.getSequenceId());
            if (s == null || s.getSequence() == null) {
                throw new IllegalArgumentException("Sequence introuvable (id=" + req.getSequenceId() + ")");
            }
            original = s.getSequence();
        } else if (req.getOriginalSequence() != null && !req.getOriginalSequence().isBlank()) {
            original = req.getOriginalSequence();
        } else {
            throw new IllegalArgumentException("Tu dois fournir soit sequenceId soit originalSequence.");
        }

        original = cleanDNA(original);

        // 2) calculer combien de mutations appliquer
        int n = Math.max(1, (int)Math.round(original.length() * req.getMutationRate()));

        // 3) créer une Simulation en BD
        MutationSimulation sim = new MutationSimulation();
        sim.setOriginalSequence(original);
        sim.setMutationType(req.getMutationType().name());
        sim.setMutationRate(req.getMutationRate());
        sim.setVariantsCount(req.getVariants());
        sim.setAlignmentAlgorithm(req.getAlignmentAlgorithm().name());

        List<MutationVariantResult> results = new ArrayList<>();

        // 4) générer variantes + aligner + stocker
        for (int k = 0; k < req.getVariants(); k++) {
            String mutated = mutate(original, req.getMutationType(), n);

            AlignmentResponse align = alignmentClient.align(
                    new AlignmentRequest(original, mutated, req.getAlignmentAlgorithm())
            );

            MutationVariant v = new MutationVariant();
            v.setSimulation(sim);
            v.setMutatedSequence(mutated);
            v.setAlignedOriginal(align.getAlignedSeq1());
            v.setAlignedMutated(align.getAlignedSeq2());
            v.setScore(align.getScore());
            v.setIdentityPercent(align.getIdentityPercent());

            sim.getVariants().add(v);

            results.add(new MutationVariantResult(mutated, align));
        }

        simulationRepo.save(sim);

        return new MutationSimulateResponse(original, results);
    }

    private String cleanDNA(String s) {
        String seq = s.replaceAll("\\s+", "").toUpperCase();
        if (!seq.matches("[ATCG]+")) throw new IllegalArgumentException("Séquence invalide: uniquement A,T,C,G.");
        if (seq.length() < 5 || seq.length() > 10000) throw new IllegalArgumentException("Longueur invalide (5..10000).");
        return seq;
    }

    private String mutate(String original, MutationType type, int mutationsCount) {
        StringBuilder sb = new StringBuilder(original);
        for (int i = 0; i < mutationsCount; i++) {
            if (sb.length() == 0) break;
            int pos = rng.nextInt(sb.length());
            switch (type) {
                case SUBSTITUTION -> {
                    char oldBase = sb.charAt(pos);
                    char newBase = randomBaseDifferent(oldBase);
                    sb.setCharAt(pos, newBase);
                }
                case DELETION -> sb.deleteCharAt(pos);
                case INSERTION -> sb.insert(pos, BASES[rng.nextInt(BASES.length)]);
            }
        }
        return sb.toString();
    }

    private char randomBaseDifferent(char oldBase) {
        char b;
        do { b = BASES[rng.nextInt(BASES.length)]; } while (b == oldBase);
        return b;
    }

    public Map<String, Long> stats() {
        return Map.of(
                "simulations", simulationRepo.count(),
                "variants", variantRepo.count()
        );
    }

}
