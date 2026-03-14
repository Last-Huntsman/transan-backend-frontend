package com.transan.service;

import com.transan.config.JwtConfig;
import com.transan.dto.request.LoginRequest;
import com.transan.dto.request.RegistrationRequest;
import com.transan.dto.response.LoginResponse;
import com.transan.dto.response.RegistrationResponse;
import com.transan.entity.RefreshToken;
import com.transan.entity.User;
import com.transan.repository.RefreshTokenRepository;
import com.transan.repository.UserRepository;
import com.transan.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtConfig jwtConfig;

    @Transactional
    public RegistrationResponse register(RegistrationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }

        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .monthlyBudget(request.getMonthlyBudget())
                .isMale(request.getIsMale())
                .build();

        user = userRepository.save(user);
        log.info("Registered user: {}", user.getUsername());

        return new RegistrationResponse(user.getId(), user.getUsername());
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getUsername());
        String refreshTokenStr = jwtTokenProvider.generateRefreshToken();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenStr)
                .expiresAt(OffsetDateTime.now().plusSeconds(jwtConfig.getRefreshExpirationMs() / 1000))
                .build();
        refreshTokenRepository.save(refreshToken);

        return new LoginResponse(
                accessToken,
                refreshTokenStr,
                jwtConfig.getExpirationMs() / 1000
        );
    }
}
