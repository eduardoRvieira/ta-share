package com.grupo5.ta_share.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grupo5.ta_share.model.Usuario;
import com.grupo5.ta_share.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1);
        usuario.setNome("João Silva");
        usuario.setEmail("joao@email.com");
        usuario.setSenha("$2a$10$hashSenhaCriptografada");
        usuario.setPerfil("ADMIN");
    }

    @Test
    @DisplayName("POST /api/auth/login - Deve autenticar com sucesso e retornar 200 com LoginResponseDTO")
    void deveRealizarLoginComSucesso() throws Exception {
        Map<String, String> body = Map.of(
                "email", "joao@email.com",
                "senha", "senha123"
        );

        when(usuarioRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("senha123", usuario.getSenha())).thenReturn(true);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("João Silva"))
                .andExpect(jsonPath("$.email").value("joao@email.com"))
                .andExpect(jsonPath("$.perfil").value("ADMIN"));

        verify(usuarioRepository).findByEmail("joao@email.com");
        verify(passwordEncoder).matches("senha123", usuario.getSenha());
    }

    @Test
    @DisplayName("POST /api/auth/login - Deve remover espaços extras do e-mail com trim() antes de buscar")
    void deveRemoverEspacosDoEmailAntesDeAutenticar() throws Exception {
        Map<String, String> body = Map.of(
                "email", "  joao@email.com  ",
                "senha", "senha123"
        );

        when(usuarioRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("senha123", usuario.getSenha())).thenReturn(true);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("joao@email.com"));

        verify(usuarioRepository).findByEmail("joao@email.com");
    }

    @Test
    @DisplayName("POST /api/auth/login - Deve retornar 400 quando e-mail estiver em branco")
    void deveRetornar400QuandoEmailEmBranco() throws Exception {
        Map<String, String> body = Map.of(
                "email", "   ",
                "senha", "senha123"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());

        verify(usuarioRepository, never()).findByEmail(any());
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    @DisplayName("POST /api/auth/login - Deve retornar 400 quando e-mail for nulo")
    void deveRetornar400QuandoEmailNulo() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("email", null);
        body.put("senha", "senha123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());

        verify(usuarioRepository, never()).findByEmail(any());
    }

    @Test
    @DisplayName("POST /api/auth/login - Deve retornar 400 quando senha estiver em branco")
    void deveRetornar400QuandoSenhaEmBranco() throws Exception {
        Map<String, String> body = Map.of(
                "email", "joao@email.com",
                "senha", "   "
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());

        verify(usuarioRepository, never()).findByEmail(any());
    }

    @Test
    @DisplayName("POST /api/auth/login - Deve retornar 400 quando senha for nula")
    void deveRetornar400QuandoSenhaNula() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("email", "joao@email.com");
        body.put("senha", null);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());

        verify(usuarioRepository, never()).findByEmail(any());
    }

    @Test
    @DisplayName("POST /api/auth/login - Deve retornar 401 quando e-mail não existir no banco")
    void deveRetornar401QuandoUsuarioNaoEncontrado() throws Exception {
        Map<String, String> body = Map.of(
                "email", "inexistente@email.com",
                "senha", "senha123"
        );

        when(usuarioRepository.findByEmail("inexistente@email.com")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized());

        verify(usuarioRepository).findByEmail("inexistente@email.com");
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    @DisplayName("POST /api/auth/login - Deve retornar 401 quando a senha estiver incorreta")
    void deveRetornar401QuandoSenhaIncorreta() throws Exception {
        Map<String, String> body = Map.of(
                "email", "joao@email.com",
                "senha", "senhaErrada"
        );

        when(usuarioRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("senhaErrada", usuario.getSenha())).thenReturn(false);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized());

        verify(usuarioRepository).findByEmail("joao@email.com");
        verify(passwordEncoder).matches("senhaErrada", usuario.getSenha());
    }
}