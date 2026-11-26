package com.grupo5.ta_share.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grupo5.ta_share.dto.request.UsuarioRequestDTO;
import com.grupo5.ta_share.dto.response.UsuarioResponseDTO;
import com.grupo5.ta_share.service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UsuarioController.class)
@AutoConfigureMockMvc(addFilters = false)
class UsuarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UsuarioService usuarioService;

    private UsuarioRequestDTO requestDTO;
    private UsuarioResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        requestDTO = new UsuarioRequestDTO(
                "João Silva",
                "joao@email.com",
                "senha123",
                "52998224725", // CPF válido para passar na validação @CPF
                    "47999998888",
                "ADMIN"
        );

        responseDTO = new UsuarioResponseDTO(
                1,
                "João Silva",
                "joao@email.com",
                "47999998888",
                "ADMIN",
                LocalDateTime.of(2026, 11, 26, 20, 0)
        );
    }

    @Test
    @DisplayName("GET /api/usuarios - Deve listar todos os usuários e retornar status 200")
    void deveListarTodosOsUsuarios() throws Exception {
        when(usuarioService.listarTodos()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].nome").value("João Silva"))
                .andExpect(jsonPath("$[0].email").value("joao@email.com"))
                .andExpect(jsonPath("$[0].perfil").value("ADMIN"));

        verify(usuarioService, times(1)).listarTodos();
    }

    @Test
    @DisplayName("GET /api/usuarios - Deve retornar lista vazia com status 200 quando não houver usuários")
    void deveRetornarListaVaziaQuandoNaoHouverUsuarios() throws Exception {
        when(usuarioService.listarTodos()).thenReturn(List.of());

        mockMvc.perform(get("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(0));

        verify(usuarioService, times(1)).listarTodos();
    }

    @Test
    @DisplayName("POST /api/usuarios - Deve criar usuário válido e retornar status 201")
    void deveCriarUsuarioComSucesso() throws Exception {
        when(usuarioService.criar(any(UsuarioRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("João Silva"))
                .andExpect(jsonPath("$.email").value("joao@email.com"))
                .andExpect(jsonPath("$.perfil").value("ADMIN"));

        verify(usuarioService, times(1)).criar(any(UsuarioRequestDTO.class));
    }

    @Test
    @DisplayName("POST /api/usuarios - Deve retornar status 400 quando payload vier vazio ({}) (@Valid)")
    void deveRetornarBadRequestAoCriarUsuarioVazio() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());

        verify(usuarioService, never()).criar(any());
    }

    @Test
    @DisplayName("POST /api/usuarios - Deve retornar status 400 quando campos obrigatórios vierem em branco")
    void deveRetornarBadRequestAoCriarUsuarioComCamposEmBranco() throws Exception {
        UsuarioRequestDTO dtoVazio = new UsuarioRequestDTO("", "", "", "", "", "");

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dtoVazio)))
                .andExpect(status().isBadRequest());

        verify(usuarioService, never()).criar(any());
    }

    @Test
    @DisplayName("POST /api/usuarios - Deve retornar status 400 quando CPF ou e-mail forem inválidos")
    void deveRetornarBadRequestQuandoCpfOuEmailInvalidos() throws Exception {
        UsuarioRequestDTO dtoInvalido = new UsuarioRequestDTO(
                "João Silva",
                "email-invalido",
                "senha123",
                "11111111111", // CPF inválido
                "47999998888",
                "ADMIN"
        );

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dtoInvalido)))
                .andExpect(status().isBadRequest());

        verify(usuarioService, never()).criar(any());
    }

    @Test
    @DisplayName("POST /api/usuarios - Deve repassar exceção quando e-mail ou CPF já estiver cadastrado")
    void deveRepassarExcecaoQuandoDadosDuplicados() throws Exception {
        when(usuarioService.criar(any(UsuarioRequestDTO.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "E-mail ou CPF já cadastrado"));

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isConflict());

        verify(usuarioService, times(1)).criar(any(UsuarioRequestDTO.class));
    }

    @Test
    @DisplayName("GET /api/usuarios/{id} - Deve retornar usuário quando ID existir (status 200)")
    void deveBuscarPorIdComSucesso() throws Exception {
        Integer id = 1;
        when(usuarioService.buscarPorId(id)).thenReturn(Optional.of(responseDTO));

        mockMvc.perform(get("/api/usuarios/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.nome").value("João Silva"));

        verify(usuarioService, times(1)).buscarPorId(id);
    }

    @Test
    @DisplayName("GET /api/usuarios/{id} - Deve retornar status 404 quando ID não existir")
    void deveRetornarNotFoundAoBuscarPorIdInexistente() throws Exception {
        Integer id = 99;
        when(usuarioService.buscarPorId(id)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/usuarios/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(usuarioService, times(1)).buscarPorId(id);
    }

    @Test
    @DisplayName("DELETE /api/usuarios/{id} - Deve deletar usuário existente e retornar status 204")
    void deveDeletarUsuarioComSucesso() throws Exception {
        Integer id = 1;
        when(usuarioService.deletar(id)).thenReturn(true);

        mockMvc.perform(delete("/api/usuarios/{id}", id))
                .andExpect(status().isNoContent());

        verify(usuarioService, times(1)).deletar(id);
    }

    @Test
    @DisplayName("DELETE /api/usuarios/{id} - Deve retornar status 404 ao tentar deletar ID inexistente")
    void deveRetornarNotFoundAoDeletarIdInexistente() throws Exception {
        Integer id = 99;
        when(usuarioService.deletar(id)).thenReturn(false);

        mockMvc.perform(delete("/api/usuarios/{id}", id))
                .andExpect(status().isNotFound());

        verify(usuarioService, times(1)).deletar(id);
    }

    @Test
    @DisplayName("PUT /api/usuarios/{id} - Deve atualizar usuário existente e retornar status 200")
    void deveAtualizarUsuarioComSucesso() throws Exception {
        Integer id = 1;
        UsuarioResponseDTO atualizado = new UsuarioResponseDTO(
                1,
                "João Atualizado",
                "joao@email.com",
                "47999998888",
                "COMUM",
                LocalDateTime.of(2026, 11, 26, 20, 0)
        );
        when(usuarioService.atualizar(eq(id), any(UsuarioRequestDTO.class)))
                .thenReturn(Optional.of(atualizado));

        mockMvc.perform(put("/api/usuarios/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.nome").value("João Atualizado"))
                .andExpect(jsonPath("$.perfil").value("COMUM"));

        verify(usuarioService, times(1)).atualizar(eq(id), any(UsuarioRequestDTO.class));
    }

    @Test
    @DisplayName("PUT /api/usuarios/{id} - Deve retornar status 404 ao tentar atualizar ID inexistente")
    void deveRetornarNotFoundAoAtualizarIdInexistente() throws Exception {
        Integer id = 99;
        when(usuarioService.atualizar(eq(id), any(UsuarioRequestDTO.class)))
                .thenReturn(Optional.empty());

        mockMvc.perform(put("/api/usuarios/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isNotFound());

        verify(usuarioService, times(1)).atualizar(eq(id), any(UsuarioRequestDTO.class));
    }

    @Test
    @DisplayName("PUT /api/usuarios/{id} - Deve retornar status 400 quando payload de atualização vier vazio ({}) (@Valid)")
    void deveRetornarBadRequestAoAtualizarUsuarioVazio() throws Exception {
        mockMvc.perform(put("/api/usuarios/{id}", 1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());

        verify(usuarioService, never()).atualizar(any(), any());
    }
}