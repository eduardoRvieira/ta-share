package com.grupo5.ta_share.service;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

class PasswordEncoderSegurancaTest {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    void deveGerarHashesDiferentesParaMesmaSenhaEValidarCorretamente() {
        String senhaPura = "senhaSegura123";

        // Criptografa a mesma senha duas vezes
        String hash1 = passwordEncoder.encode(senhaPura);
        String hash2 = passwordEncoder.encode(senhaPura);

        // 1. Garante que os hashes são diferentes (devido ao salt aleatório)
        assertNotEquals(hash1, hash2, "Os hashes gerados para a mesma senha devem ser diferentes.");

        // 2. Garante que o encoder consegue validar a senha original contra ambos os hashes
        assertTrue(passwordEncoder.matches(senhaPura, hash1), "O hash 1 deveria ser válido para a senha pura.");
        assertTrue(passwordEncoder.matches(senhaPura, hash2), "O hash 2 deveria ser válido para a senha pura.");

        // 3. Garante que uma senha errada falha na validação
        assertFalse(passwordEncoder.matches("senhaErrada", hash1), " Senha incorreta.");
    }
}