package com.example.algobio.similarity.client.dto;

import java.time.LocalDateTime;

public class SequenceDto {
    private Long id;
    private String sequence;
    private String name;
    private String type;
    private String classification;
    private int length;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSequence() { return sequence; }
    public void setSequence(String sequence) { this.sequence = sequence; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getClassification() { return classification; }
    public void setClassification(String classification) { this.classification = classification; }

    public int getLength() { return length; }
    public void setLength(int length) { this.length = length; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
