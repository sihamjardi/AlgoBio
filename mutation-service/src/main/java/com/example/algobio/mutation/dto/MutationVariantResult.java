package com.example.algobio.mutation.dto;

public class MutationVariantResult {
    private String mutatedSequence;
    private AlignmentResponse alignment;

    public MutationVariantResult() {}
    public MutationVariantResult(String mutatedSequence, AlignmentResponse alignment) {
        this.mutatedSequence = mutatedSequence;
        this.alignment = alignment;
    }

    public String getMutatedSequence() { return mutatedSequence; }
    public void setMutatedSequence(String mutatedSequence) { this.mutatedSequence = mutatedSequence; }
    public AlignmentResponse getAlignment() { return alignment; }
    public void setAlignment(AlignmentResponse alignment) { this.alignment = alignment; }
}
