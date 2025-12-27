package com.example.algobio.similarity.dto;

import jakarta.validation.constraints.*;

public class SimilaritySearchRequest {

    private Long sequenceId;          // option 1
    private String querySequence;     // option 2 (fallback)

    @NotNull
    private SimilarityProgram program;

    @NotNull
    private AlignmentAlgorithm alignmentAlgorithm;

    @Min(1) @Max(500)
    private int maxResults = 100;

    // "nr", "refseq", "pdb"... juste pour UI (pas utilisé dans l'algo ici)
    private String database = "nr";

    public Long getSequenceId() { return sequenceId; }
    public void setSequenceId(Long sequenceId) { this.sequenceId = sequenceId; }

    public String getQuerySequence() { return querySequence; }
    public void setQuerySequence(String querySequence) { this.querySequence = querySequence; }

    public SimilarityProgram getProgram() { return program; }
    public void setProgram(SimilarityProgram program) { this.program = program; }

    public AlignmentAlgorithm getAlignmentAlgorithm() { return alignmentAlgorithm; }
    public void setAlignmentAlgorithm(AlignmentAlgorithm alignmentAlgorithm) { this.alignmentAlgorithm = alignmentAlgorithm; }

    public int getMaxResults() { return maxResults; }
    public void setMaxResults(int maxResults) { this.maxResults = maxResults; }

    public String getDatabase() { return database; }
    public void setDatabase(String database) { this.database = database; }
}
