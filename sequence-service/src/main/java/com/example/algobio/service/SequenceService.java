package com.example.algobio.service;


import com.example.algobio.dto.SequenceRequest;
import com.example.algobio.entity.Sequence;
import com.example.algobio.repository.SequenceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SequenceService {

    private final SequenceRepository repository;

    public SequenceService(SequenceRepository repository) {
        this.repository = repository;
    }

    public Sequence createSequence(SequenceRequest request) {

        String seq = request.getSequence().toUpperCase().trim();

        if (!seq.matches("[ATCG]+")) {
            throw new IllegalArgumentException("La séquence doit contenir uniquement A, T, C ou G.");
        }

        if (seq.length() < 200 || seq.length() > 10000) {
            throw new IllegalArgumentException("La longueur de la séquence doit être >= 200 (pour la classification) et <= 10000.");
        }


        Sequence s = new Sequence();
        s.setSequence(seq);
        s.setName(request.getName());

        s.setLength(seq.length());
        s.setType("DNA");
        s.setClassification("Unclassified");
        return repository.save(s);
    }


    public java.util.List<Sequence> getAllSequences() {
        return repository.findAll();
    }

    public Sequence getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Séquence introuvable"));
    }
}
