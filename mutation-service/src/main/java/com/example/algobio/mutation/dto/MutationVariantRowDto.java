package com.example.algobio.mutation.dto;

import java.time.LocalDateTime;

public record MutationVariantRowDto(
        Long id,
        LocalDateTime createdAt,
        int mutatedLength,
        int score,
        double identityPercent,
        String mutatedSequence,
        String alignedOriginal,
        String alignedMutated
) {}
