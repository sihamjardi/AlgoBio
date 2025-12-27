package com.example.algobio.alignment.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alignment_results")
public class AlignmentResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10000)
    private String sequence1;

    @Column(nullable = false, length = 10000)
    private String sequence2;

    @Column(nullable = false)
    private String algorithm;

    @Column(nullable = false, length = 12000)
    private String aligned1;

    @Column(nullable = false, length = 12000)
    private String aligned2;

    @Column(nullable = false)
    private int score;

    @Column(nullable = false)
    private double identityPercent;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSequence1() { return sequence1; }
    public void setSequence1(String sequence1) { this.sequence1 = sequence1; }

    public String getSequence2() { return sequence2; }
    public void setSequence2(String sequence2) { this.sequence2 = sequence2; }

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }

    public String getAligned1() { return aligned1; }
    public void setAligned1(String aligned1) { this.aligned1 = aligned1; }

    public String getAligned2() { return aligned2; }
    public void setAligned2(String aligned2) { this.aligned2 = aligned2; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public double getIdentityPercent() { return identityPercent; }
    public void setIdentityPercent(double identityPercent) { this.identityPercent = identityPercent; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
