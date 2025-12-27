package com.example.algobio.similarity.service;

import com.example.algobio.similarity.client.AlignmentClient;
import com.example.algobio.similarity.client.SequenceClient;
import com.example.algobio.similarity.client.dto.*;
import com.example.algobio.similarity.client.dto.SimilaritySearchRequest;
import com.example.algobio.similarity.dto.*;
import com.example.algobio.similarity.entity.SimilaritySearch;
import com.example.algobio.similarity.entity.SimilaritySearchHit;
import com.example.algobio.similarity.repository.SimilaritySearchRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SimilarityService {

    private final SequenceClient sequenceClient;
    private final AlignmentClient alignmentClient;
    private final SimilaritySearchRepository searchRepo;

    public SimilarityService(SequenceClient sequenceClient,
                             AlignmentClient alignmentClient,
                             SimilaritySearchRepository searchRepo) {
        this.sequenceClient = sequenceClient;
        this.alignmentClient = alignmentClient;
        this.searchRepo = searchRepo;
    }

    public SimilaritySearchResponse search(SimilaritySearchRequest req) {

        // 1) Get query sequence
        String query;
        if (req.getSequenceId() != null) {
            var s = sequenceClient.getById(req.getSequenceId());
            if (s == null || s.getSequence() == null) {
                throw new IllegalArgumentException("Sequence introuvable (id=" + req.getSequenceId() + ")");
            }
            query = s.getSequence();
        } else if (req.getQuerySequence() != null && !req.getQuerySequence().isBlank()) {
            query = req.getQuerySequence();
        } else {
            throw new IllegalArgumentException("Tu dois fournir soit sequenceId soit querySequence.");
        }

        query = cleanDNA(query);

        // 2) Get candidates from SEQUENCE-SERVICE
        SequenceDto[] all = sequenceClient.listAll();
        if (all == null) all = new SequenceDto[0];

        // 3) Compute similarity by aligning query vs each target
        List<SimilarityHit> hits = new ArrayList<>();

        for (SequenceDto target : all) {
            if (target == null || target.getSequence() == null) continue;

            String tSeq = cleanDNA(target.getSequence());
            if (tSeq.equals(query)) continue; // skip identical (option)

            AlignmentResponse ar = alignmentClient.align(
                    new AlignmentRequest(query, tSeq, req.getAlignmentAlgorithm())
            );

            SimilarityHit hit = new SimilarityHit();
            hit.setTargetId(target.getId());
            hit.setTargetName(target.getName());
            hit.setTargetClassification(target.getClassification());
            hit.setTargetLength(tSeq.length());
            hit.setSimilarityPercent(ar.getIdentityPercent());
            hit.setScore(ar.getScore());
            hit.setAlignedQuery(ar.getAlignedSeq1());
            hit.setAlignedTarget(ar.getAlignedSeq2());

            // eValue simple (FAKE) : juste pour UI
            hit.setEValue(fakeEValue(ar.getScore(), query.length(), tSeq.length()));

            hits.add(hit);
        }

        // 4) Sort + limit
        hits = hits.stream()
                .sorted(Comparator
                        .comparingDouble(SimilarityHit::getSimilarityPercent).reversed()
                        .thenComparingInt(SimilarityHit::getScore).reversed())
                .limit(req.getMaxResults())
                .collect(Collectors.toList());

        // 5) Save search history to DB
        SimilaritySearch entity = new SimilaritySearch();
        entity.setQuerySequence(query);
        entity.setProgram(req.getProgram().name());
        entity.setDatabase(req.getDatabase());
        entity.setAlignmentAlgorithm(req.getAlignmentAlgorithm().name());
        entity.setMaxResults(req.getMaxResults());

        for (SimilarityHit h : hits) {
            SimilaritySearchHit eh = new SimilaritySearchHit();
            eh.setSearch(entity);
            eh.setTargetId(h.getTargetId());
            eh.setTargetName(h.getTargetName());
            eh.setSimilarityPercent(h.getSimilarityPercent());
            eh.setScore(h.getScore());
            eh.setAlignedQuery(h.getAlignedQuery());
            eh.setAlignedTarget(h.getAlignedTarget());
            eh.setEValue(h.getEValue());
            entity.getHits().add(eh);
        }
        searchRepo.save(entity);

        return new SimilaritySearchResponse(
                query,
                query.length(),
                req.getDatabase(),
                req.getProgram(),
                LocalDateTime.now(),
                hits
        );
    }

    private String cleanDNA(String s) {
        String seq = s.replaceAll("\\s+", "").toUpperCase();
        if (!seq.matches("[ATCG]+")) {
            throw new IllegalArgumentException("Séquence invalide: uniquement A,T,C,G.");
        }
        if (seq.length() < 5 || seq.length() > 10000) {
            throw new IllegalArgumentException("Longueur invalide (5..10000).");
        }
        return seq;
    }

    private String fakeEValue(int score, int qLen, int tLen) {
        // Plus score est grand -> e-value plus petite (juste pour affichage)
        double v = Math.exp(-(Math.max(1, score)) / 10.0);
        // format style "2e-145" etc (fake)
        int exp = (int)Math.round(-Math.log10(v) * 10);
        if (exp < 0) exp = 0;
        return "1e-" + exp;
    }
}
