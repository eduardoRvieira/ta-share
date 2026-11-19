package com.grupo5.ta_share.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Desativa CSRF para testes fáceis no Postman
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/usuarios/**").permitAll() // Libera temporariamente para testes de cadastro
                        .requestMatchers("/api/categorias/**", "/api/equipamentos/**").permitAll() // Se quiser liberar consultas livres
                        .anyRequest().permitAll() // Qualquer outra rota exige autenticação
                );
                //.httpBasic(httpBasic -> {}); // Habilita autenticação básica (usuário e senha no header) para testar no Postman

        return http.build();
    }
}