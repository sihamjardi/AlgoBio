package com.example.algobio.alignment.service;

import com.example.algobio.alignment.dto.AlignmentAlgorithm;
import com.example.algobio.alignment.dto.AlignmentResponse;
import com.example.algobio.alignment.entity.AlignmentResult;
import com.example.algobio.alignment.repository.AlignmentResultRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@Service
public class AlignmentService {

    private final AlignmentResultRepository repo;

    public AlignmentService(AlignmentResultRepository repo) {
        this.repo = repo;
    }

    private static final int MATCH = 1;
    private static final int MISMATCH = -1;
    private static final int GAP = -2;

    public AlignmentResponse align(String s1, String s2, AlignmentAlgorithm algo) {
        String seq1 = cleanDNA(s1);
        String seq2 = cleanDNA(s2);

        if (seq1.length() > 10000 || seq2.length() > 10000) {
            throw new IllegalArgumentException("Séquences trop longues (max 10000).");
        }

        AlignmentResponse res = (algo == AlignmentAlgorithm.NEEDLEMAN_WUNSCH)
                ? needlemanWunsch(seq1, seq2)
                : smithWaterman(seq1, seq2);

        AlignmentResult ar = new AlignmentResult();
        ar.setSequence1(seq1);
        ar.setSequence2(seq2);
        ar.setAlgorithm(algo.name());
        ar.setAligned1(res.getAlignedSeq1());
        ar.setAligned2(res.getAlignedSeq2());
        ar.setScore(res.getScore());
        ar.setIdentityPercent(res.getIdentityPercent());
        repo.save(ar);

        return res;
    }

    private String cleanDNA(String s) {
        String seq = s.replaceAll("\\s+", "").toUpperCase();
        if (!seq.matches("[ATCG]+")) {
            throw new IllegalArgumentException("Séquence invalide: uniquement A,T,C,G.");
        }
        return seq;
    }

    // ------------------------
    // Needleman–Wunsch (global)
    // ------------------------
    private AlignmentResponse needlemanWunsch(String a, String b) {
        int n = a.length(), m = b.length();
        int[][] dp = new int[n + 1][m + 1];
        char[][] trace = new char[n + 1][m + 1]; // D, U, L

        for (int i = 1; i <= n; i++) {
            dp[i][0] = dp[i - 1][0] + GAP;
            trace[i][0] = 'U';
        }
        for (int j = 1; j <= m; j++) {
            dp[0][j] = dp[0][j - 1] + GAP;
            trace[0][j] = 'L';
        }

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                int diag = dp[i - 1][j - 1] + (a.charAt(i - 1) == b.charAt(j - 1) ? MATCH : MISMATCH);
                int up = dp[i - 1][j] + GAP;
                int left = dp[i][j - 1] + GAP;

                int best = diag;
                char t = 'D';
                if (up > best) { best = up; t = 'U'; }
                if (left > best) { best = left; t = 'L'; }

                dp[i][j] = best;
                trace[i][j] = t;
            }
        }

        StringBuilder alA = new StringBuilder();
        StringBuilder alB = new StringBuilder();
        int i = n, j = m;

        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && trace[i][j] == 'D') {
                alA.append(a.charAt(i - 1));
                alB.append(b.charAt(j - 1));
                i--; j--;
            } else if (i > 0 && (j == 0 || trace[i][j] == 'U')) {
                alA.append(a.charAt(i - 1));
                alB.append('-');
                i--;
            } else {
                alA.append('-');
                alB.append(b.charAt(j - 1));
                j--;
            }
        }

        alA.reverse();
        alB.reverse();

        double identity = identityPercent(alA.toString(), alB.toString());
        return new AlignmentResponse(alA.toString(), alB.toString(), dp[n][m], identity);
    }

    // ----------------------------------------
    // Smith–Waterman (local) = BLAST simplifié
    // ----------------------------------------
    private AlignmentResponse smithWaterman(String a, String b) {
        int n = a.length(), m = b.length();
        int[][] dp = new int[n + 1][m + 1];
        char[][] trace = new char[n + 1][m + 1]; // D, U, L, Z

        int bestScore = 0;
        int bestI = 0, bestJ = 0;

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                int diag = dp[i - 1][j - 1] + (a.charAt(i - 1) == b.charAt(j - 1) ? MATCH : MISMATCH);
                int up = dp[i - 1][j] + GAP;
                int left = dp[i][j - 1] + GAP;

                int best = 0;
                char t = 'Z';
                if (diag > best) { best = diag; t = 'D'; }
                if (up > best) { best = up; t = 'U'; }
                if (left > best) { best = left; t = 'L'; }

                dp[i][j] = best;
                trace[i][j] = t;

                if (best > bestScore) {
                    bestScore = best;
                    bestI = i; bestJ = j;
                }
            }
        }

        StringBuilder alA = new StringBuilder();
        StringBuilder alB = new StringBuilder();
        int i = bestI, j = bestJ;

        while (i > 0 && j > 0 && dp[i][j] > 0) {
            char t = trace[i][j];
            if (t == 'D') {
                alA.append(a.charAt(i - 1));
                alB.append(b.charAt(j - 1));
                i--; j--;
            } else if (t == 'U') {
                alA.append(a.charAt(i - 1));
                alB.append('-');
                i--;
            } else if (t == 'L') {
                alA.append('-');
                alB.append(b.charAt(j - 1));
                j--;
            } else {
                break;
            }
        }

        alA.reverse();
        alB.reverse();

        double identity = identityPercent(alA.toString(), alB.toString());
        return new AlignmentResponse(alA.toString(), alB.toString(), bestScore, identity);
    }

    private double identityPercent(String a, String b) {
        int len = Math.min(a.length(), b.length());
        if (len == 0) return 0.0;

        int matches = 0;
        int comparable = 0;

        for (int i = 0; i < len; i++) {
            char c1 = a.charAt(i);
            char c2 = b.charAt(i);
            if (c1 == '-' && c2 == '-') continue;
            comparable++;
            if (c1 == c2) matches++;
        }

        return comparable == 0 ? 0.0 : (matches * 100.0) / comparable;
    }
    @GetMapping("/stats")
    public Map<String, Long> stats() {
        return Map.of("alignments", repo.count());
    }

}
