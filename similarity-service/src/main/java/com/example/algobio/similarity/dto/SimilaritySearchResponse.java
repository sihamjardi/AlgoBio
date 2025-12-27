package com.example.algobio.similarity.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SimilaritySearchResponse {
    private String querySequence;
    private int queryLength;
    private String database;
    private SimilarityProgram program;
    private LocalDateTime createdAt;

    private List<SimilarityHit> hits;

    public SimilaritySearchResponse() {}

    public SimilaritySearchResponse(String querySequence, int queryLength, String database,
                                    SimilarityProgram program, LocalDateTime createdAt,
                                    List<SimilarityHit> hits) {
        this.querySequence = querySequence;
        this.queryLength = queryLength;
        this.database = database;
        this.program = program;
        this.createdAt = createdAt;
        this.hits = hits;
    }

    public String getQuerySequence() { return querySequence; }
    public void setQuerySequence(String querySequence) { this.querySequence = querySequence; }

    public int getQueryLength() { return queryLength; }
    public void setQueryLength(int queryLength) { this.queryLength = queryLength; }

    public String getDatabase() { return database; }
    public void setDatabase(String database) { this.database = database; }

    public SimilarityProgram getProgram() { return program; }
    public void setProgram(SimilarityProgram program) { this.program = program; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<SimilarityHit> getHits() { return hits; }
    public void setHits(List<SimilarityHit> hits) { this.hits = hits; }
}
