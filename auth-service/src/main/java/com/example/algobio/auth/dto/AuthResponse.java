package com.example.algobio.auth.dto;

public class AuthResponse {
    private String token;
    private Long userId;
    private String fullName;
    private String email;
    private String profession;
    private String country;
    private String bio;

    public AuthResponse() {}

    public AuthResponse(String token, Long userId, String fullName, String email,
                        String profession, String country, String bio) {
        this.token = token;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.profession = profession;
        this.country = country;
        this.bio = bio;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getProfession() { return profession; }
    public void setProfession(String profession) { this.profession = profession; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
