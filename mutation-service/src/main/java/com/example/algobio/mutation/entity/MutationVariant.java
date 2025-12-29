package com.example.algobio.mutation.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mutation_variants")
public class MutationVariant {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne(optional=false)
    @JoinColumn(name="simulation_id")
    private MutationSimulation simulation;

    @Column(nullable=false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(nullable=false, length=12000)
    private String mutatedSequence;

    @Column(nullable=false, length=12000)
    private String alignedOriginal;

    @Column(nullable=false, length=12000)
    private String alignedMutated;

    @Column(nullable=false)
    private int score;

    @Column(nullable=false)
    private double identityPercent;

    public Long getId() { return id; }

    public MutationSimulation getSimulation() { return simulation; }
    public void setSimulation(MutationSimulation simulation) { this.simulation = simulation; }

    public String getMutatedSequence() { return mutatedSequence; }
    public void setMutatedSequence(String mutatedSequence) { this.mutatedSequence = mutatedSequence; }

    public String getAlignedOriginal() { return alignedOriginal; }
    public void setAlignedOriginal(String alignedOriginal) { this.alignedOriginal = alignedOriginal; }

    public String getAlignedMutated() { return alignedMutated; }
    public void setAlignedMutated(String alignedMutated) { this.alignedMutated = alignedMutated; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public double getIdentityPercent() { return identityPercent; }
    public void setIdentityPercent(double identityPercent) { this.identityPercent = identityPercent; }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
