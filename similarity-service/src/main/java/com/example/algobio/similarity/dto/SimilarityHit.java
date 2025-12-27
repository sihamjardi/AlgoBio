package com.example.algobio.similarity.dto;

public class SimilarityHit {
    private Long targetId;
    private String targetName;
    private String targetClassification;
    private int targetLength;

    private double similarityPercent;
    private int score;

    private String alignedQuery;
    private String alignedTarget;

    // eValue (fake/simple) juste pour UI
    private String eValue;

    public Long getTargetId() { return targetId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }

    public String getTargetName() { return targetName; }
    public void setTargetName(String targetName) { this.targetName = targetName; }

    public String getTargetClassification() { return targetClassification; }
    public void setTargetClassification(String targetClassification) { this.targetClassification = targetClassification; }

    public int getTargetLength() { return targetLength; }
    public void setTargetLength(int targetLength) { this.targetLength = targetLength; }

    public double getSimilarityPercent() { return similarityPercent; }
    public void setSimilarityPercent(double similarityPercent) { this.similarityPercent = similarityPercent; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public String getAlignedQuery() { return alignedQuery; }
    public void setAlignedQuery(String alignedQuery) { this.alignedQuery = alignedQuery; }

    public String getAlignedTarget() { return alignedTarget; }
    public void setAlignedTarget(String alignedTarget) { this.alignedTarget = alignedTarget; }

    public String getEValue() { return eValue; }
    public void setEValue(String eValue) { this.eValue = eValue; }
}
