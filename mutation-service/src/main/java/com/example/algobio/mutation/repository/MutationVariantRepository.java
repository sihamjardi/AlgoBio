package com.example.algobio.mutation.repository;

import com.example.algobio.mutation.entity.MutationVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MutationVariantRepository extends JpaRepository<MutationVariant, Long> {
    List<MutationVariant> findBySimulationIdOrderByIdAsc(Long simulationId);
}
