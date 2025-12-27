package com.example.algobio.mutation.dto;

import java.util.List;

public class MutationSimulateResponse {
    private String originalSequence;
    private List<MutationVariantResult> variants;

    public MutationSimulateResponse() {}
    public MutationSimulateResponse(String originalSequence, List<MutationVariantResult> variants) {
        this.originalSequence = originalSequence;
        this.variants = variants;
    }

    public String getOriginalSequence() { return originalSequence; }
    public void setOriginalSequence(String originalSequence) { this.originalSequence = originalSequence; }
    public List<MutationVariantResult> getVariants() { return variants; }
    public void setVariants(List<MutationVariantResult> variants) { this.variants = variants; }
}
