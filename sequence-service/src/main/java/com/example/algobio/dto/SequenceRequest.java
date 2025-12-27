package com.example.algobio.dto;

import jakarta.validation.constraints.NotBlank;

public class SequenceRequest {

    @NotBlank
    private String sequence;

    @NotBlank
    private String name;

    public String getSequence() { return sequence; }
    public void setSequence(String sequence) { this.sequence = sequence; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
