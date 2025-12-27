package com.example.algobio.similarity.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "similarity_search_hits")
public class SimilaritySearchHit {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false)
    @JoinColumn(name="search_id")
    private SimilaritySearch search;

    @Column(nullable=false)
    private Long targetId;

    @Column(nullable=false)
    private String targetName;

    @Column(nullable=false)
    private double similarityPercent;

    @Column(nullable=false)
    private int score;

    @Column(nullable=false, length=12000)
    private String alignedQuery;

    @Column(nullable=false, length=12000)
    private String alignedTarget;

    @Column(nullable=false)
    private String eValue;

    public Long getId() { return id; }

    public SimilaritySearch getSearch() { return search; }
    public void setSearch(SimilaritySearch search) { this.search = search; }

    public Long getTargetId() { return targetId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }

    public String getTargetName() { return targetName; }
    public void setTargetName(String targetName) { this.targetName = targetName; }

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
