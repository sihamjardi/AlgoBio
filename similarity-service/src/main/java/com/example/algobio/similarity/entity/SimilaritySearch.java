package com.example.algobio.similarity.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "similarity_searches")
public class SimilaritySearch {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, length=10000)
    private String querySequence;

    @Column(nullable=false)
    private String program;

    @Column(nullable=false)
    private String database;

    @Column(nullable=false)
    private String alignmentAlgorithm;

    @Column(nullable=false)
    private int maxResults;

    @Column(nullable=false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy="search", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<SimilaritySearchHit> hits = new ArrayList<>();

    public Long getId() { return id; }

    public String getQuerySequence() { return querySequence; }
    public void setQuerySequence(String querySequence) { this.querySequence = querySequence; }

    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }

    public String getDatabase() { return database; }
    public void setDatabase(String database) { this.database = database; }

    public String getAlignmentAlgorithm() { return alignmentAlgorithm; }
    public void setAlignmentAlgorithm(String alignmentAlgorithm) { this.alignmentAlgorithm = alignmentAlgorithm; }

    public int getMaxResults() { return maxResults; }
    public void setMaxResults(int maxResults) { this.maxResults = maxResults; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public List<SimilaritySearchHit> getHits() { return hits; }
}
