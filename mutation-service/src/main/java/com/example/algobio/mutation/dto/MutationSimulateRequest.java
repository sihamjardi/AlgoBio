package com.example.algobio.mutation.dto;

import jakarta.validation.constraints.*;
public class MutationSimulateRequest {

    private Long sequenceId; // option idéale (récupérer depuis SEQUENCE-SERVICE)

    private String originalSequence; // fallback si tu veux envoyer la séquence directe

    @NotNull
    private MutationType mutationType;

    @DecimalMin("0.0") @DecimalMax("1.0")
    private double mutationRate;

    @Min(1) @Max(50)
    private int variants = 5;

    @NotNull
    private AlignmentAlgorithm alignmentAlgorithm;

    public Long getSequenceId() { return sequenceId; }
    public void setSequenceId(Long sequenceId) { this.sequenceId = sequenceId; }

    public String getOriginalSequence() { return originalSequence; }
    public void setOriginalSequence(String originalSequence) { this.originalSequence = originalSequence; }

    public MutationType getMutationType() { return mutationType; }
    public void setMutationType(MutationType mutationType) { this.mutationType = mutationType; }

    public double getMutationRate() { return mutationRate; }
    public void setMutationRate(double mutationRate) { this.mutationRate = mutationRate; }

    public int getVariants() { return variants; }
    public void setVariants(int variants) { this.variants = variants; }

    public AlignmentAlgorithm getAlignmentAlgorithm() { return alignmentAlgorithm; }
    public void setAlignmentAlgorithm(AlignmentAlgorithm alignmentAlgorithm) { this.alignmentAlgorithm = alignmentAlgorithm; }
}
