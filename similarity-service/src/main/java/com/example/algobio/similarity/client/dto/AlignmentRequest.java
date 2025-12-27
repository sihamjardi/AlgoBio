package com.example.algobio.similarity.client.dto;

import com.example.algobio.similarity.dto.AlignmentAlgorithm;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AlignmentRequest {
    @NotBlank
    private String seq1;
    @NotBlank
    private String seq2;
    @NotNull
    private AlignmentAlgorithm algorithm;

    public AlignmentRequest() {}

    public AlignmentRequest(String seq1, String seq2, AlignmentAlgorithm algorithm) {
        this.seq1 = seq1;
        this.seq2 = seq2;
        this.algorithm = algorithm;
    }

    public String getSeq1() { return seq1; }
    public void setSeq1(String seq1) { this.seq1 = seq1; }

    public String getSeq2() { return seq2; }
    public void setSeq2(String seq2) { this.seq2 = seq2; }

    public AlignmentAlgorithm getAlgorithm() { return algorithm; }
    public void setAlgorithm(AlignmentAlgorithm algorithm) { this.algorithm = algorithm; }
}
