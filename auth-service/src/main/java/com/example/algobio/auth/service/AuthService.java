package com.example.algobio.auth.service;

import com.example.algobio.auth.dto.AuthResponse;
import com.example.algobio.auth.dto.LoginRequest;
import com.example.algobio.auth.dto.RegisterRequest;
import com.example.algobio.auth.entity.User;
import com.example.algobio.auth.repository.UserRepository;
import com.example.algobio.auth.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    public AuthService(UserRepository repo, PasswordEncoder encoder, JwtUtil jwt) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Transactional
    public void register(RegisterRequest r) {
        if (repo.existsByEmail(r.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User u = new User();
        u.setFullName(r.getFullName());
        u.setEmail(r.getEmail());
        u.setProfession(r.getProfession());
        u.setCountry(r.getCountry());
        u.setBio(r.getBio());
        u.setPassword(encoder.encode(r.getPassword()));

        repo.save(u);
        // IMPORTANT: pas de token ici (l'utilisateur doit faire login après)
    }

    public AuthResponse login(LoginRequest r) {
        User u = repo.findByEmail(r.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!encoder.matches(r.getPassword(), u.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwt.generate(u);

        return new AuthResponse(
                token,
                u.getId(),
                u.getFullName(),
                u.getEmail(),
                u.getProfession(),
                u.getCountry(),
                u.getBio()
        );
    }
}
