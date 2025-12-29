package com.example.algobio.alignment.repository;

import com.example.algobio.alignment.entity.AlignmentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AlignmentResultRepository extends JpaRepository<AlignmentResult, Long> {

    @Query(value = """
    SELECT ('W' || CEIL(EXTRACT(DAY FROM created_at)/7.0)) AS week,
           COUNT(*) AS alignments
    FROM alignment_results
    GROUP BY week
    ORDER BY week
  """, nativeQuery = true)
    List<Object[]> countByWeekOfMonth();
    List<AlignmentResult> findTop200ByOrderByCreatedAtDesc();
}

