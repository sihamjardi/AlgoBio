package com.example.algobio.mutation.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mutation_simulations")
public class MutationSimulation {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, length=10000)
    private String originalSequence;

    @Column(nullable=false)
    private String mutationType;

    @Column(nullable=false)
    private double mutationRate;

    @Column(nullable=false)
    private int variantsCount;

    @Column(nullable=false)
    private String alignmentAlgorithm;

    @Column(nullable=false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy="simulation", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<MutationVariant> variants = new ArrayList<>();

    // getters/setters
    public Long getId() { return id; }
    public String getOriginalSequence() { return originalSequence; }
    public void setOriginalSequence(String originalSequence) { this.originalSequence = originalSequence; }
    public String getMutationType() { return mutationType; }
    public void setMutationType(String mutationType) { this.mutationType = mutationType; }
    public double getMutationRate() { return mutationRate; }
    public void setMutationRate(double mutationRate) { this.mutationRate = mutationRate; }
    public int getVariantsCount() { return variantsCount; }
    public void setVariantsCount(int variantsCount) { this.variantsCount = variantsCount; }
    public String getAlignmentAlgorithm() { return alignmentAlgorithm; }
    public void setAlignmentAlgorithm(String alignmentAlgorithm) { this.alignmentAlgorithm = alignmentAlgorithm; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public List<MutationVariant> getVariants() { return variants; }
}
