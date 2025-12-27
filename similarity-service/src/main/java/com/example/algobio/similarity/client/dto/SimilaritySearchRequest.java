package com.example.algobio.similarity.client.dto;

import jakarta.validation.constraints.*;

public class SimilaritySearchRequest {

    private Long sequenceId;

    private String querySequence;

    @NotBlank
    private String database;

    @NotBlank
    private String program;

    @Min(1) @Max(500)
    private int maxResults = 50;

    @DecimalMin("0.0") @DecimalMax("100.0")
    private double minSimilarity = 0.0;

    public Long getSequenceId() { return sequenceId; }
    public void setSequenceId(Long sequenceId) { this.sequenceId = sequenceId; }

    public String getQuerySequence() { return querySequence; }
    public void setQuerySequence(String querySequence) { this.querySequence = querySequence; }

    public String getDatabase() { return database; }
    public void setDatabase(String database) { this.database = database; }

    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }

    public int getMaxResults() { return maxResults; }
    public void setMaxResults(int maxResults) { this.maxResults = maxResults; }

    public double getMinSimilarity() { return minSimilarity; }
    public void setMinSimilarity(double minSimilarity) { this.minSimilarity = minSimilarity; }
}
