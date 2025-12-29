package com.example.algobio.mutation.dto;

import java.time.LocalDateTime;

public record MutationSimulationRowDto(
        Long id,
        String mutationType,
        double mutationRate,
        int variantsCount,
        String alignmentAlgorithm,
        LocalDateTime createdAt,
        int originalLength
) {}
