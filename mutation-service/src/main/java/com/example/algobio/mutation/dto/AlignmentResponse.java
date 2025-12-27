package com.example.algobio.mutation.dto;

public class AlignmentResponse {
    private String alignedSeq1;
    private String alignedSeq2;
    private int score;
    private double identityPercent;

    public String getAlignedSeq1() { return alignedSeq1; }
    public void setAlignedSeq1(String alignedSeq1) { this.alignedSeq1 = alignedSeq1; }
    public String getAlignedSeq2() { return alignedSeq2; }
    public void setAlignedSeq2(String alignedSeq2) { this.alignedSeq2 = alignedSeq2; }
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    public double getIdentityPercent() { return identityPercent; }
    public void setIdentityPercent(double identityPercent) { this.identityPercent = identityPercent; }
}
