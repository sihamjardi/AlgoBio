package com.example.algobio.alignment.dto;

public class AlignmentResponse {
    private String alignedSeq1;
    private String alignedSeq2;
    private int score;
    private double identityPercent;

    public AlignmentResponse(String a1, String a2, int score, double identityPercent) {
        this.alignedSeq1 = a1;
        this.alignedSeq2 = a2;
        this.score = score;
        this.identityPercent = identityPercent;
    }

    public String getAlignedSeq1() { return alignedSeq1; }
    public String getAlignedSeq2() { return alignedSeq2; }
    public int getScore() { return score; }
    public double getIdentityPercent() { return identityPercent; }
}
