package com.grupo5.ta_share.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grupo5.ta_share.dto.request.EquipamentoRequestDTO;
import com.grupo5.ta_share.dto.response.EquipamentoResponseDTO;
import com.grupo5.ta_share.service.EquipamentoService;
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

@WebMvcTest(EquipamentoController.class)
@AutoConfigureMockMvc(addFilters = false)
class EquipamentoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EquipamentoService equipamentoService;

    private EquipamentoRequestDTO requestDTO;
    private EquipamentoResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        requestDTO = new EquipamentoRequestDTO(
                "Notebook Dell",
                "PAT-001",
                1,
                "BOM",
                "DISPONIVEL",
                "Notebook i7 16GB"
        );

        responseDTO = new EquipamentoResponseDTO(
                10,
                "Notebook Dell",
                "PAT-001",
                1,
                "Informática",
                "BOM",
                "DISPONIVEL",
                "Notebook i7 16GB",
                LocalDateTime.of(2026, 11, 26, 10, 0)
        );
    }

    @Test
    @DisplayName("GET /api/equipamentos - Deve listar todos os equipamentos e retornar status 200")
    void deveListarTodosOsEquipamentos() throws Exception {
        when(equipamentoService.listarTodos()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/equipamentos")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].nome").value("Notebook Dell"))
                .andExpect(jsonPath("$[0].patrimonio").value("PAT-001"))
                .andExpect(jsonPath("$[0].categoriaNome").value("Informática"));

        verify(equipamentoService, times(1)).listarTodos();
    }

    @Test
    @DisplayName("POST /api/equipamentos - Deve criar equipamento válido e retornar status 201")
    void deveCriarEquipamentoComSucesso() throws Exception {
        when(equipamentoService.criar(any(EquipamentoRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/api/equipamentos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.nome").value("Notebook Dell"))
                .andExpect(jsonPath("$.statusItem").value("DISPONIVEL"));

        verify(equipamentoService, times(1)).criar(any(EquipamentoRequestDTO.class));
    }

    @Test
    @DisplayName("POST /api/equipamentos - Deve retornar status 404 quando categoria informada não existir")
    void deveRetornarNotFoundAoCriarComCategoriaInexistente() throws Exception {
        when(equipamentoService.criar(any(EquipamentoRequestDTO.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada"));

        mockMvc.perform(post("/api/equipamentos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isNotFound());

        verify(equipamentoService, times(1)).criar(any(EquipamentoRequestDTO.class));
    }

    @Test
    @DisplayName("GET /api/equipamentos/{id} - Deve retornar equipamento quando ID existir (status 200)")
    void deveBuscarPorIdComSucesso() throws Exception {
        Integer id = 10;
        when(equipamentoService.buscarPorId(id)).thenReturn(Optional.of(responseDTO));

        mockMvc.perform(get("/api/equipamentos/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.nome").value("Notebook Dell"));

        verify(equipamentoService, times(1)).buscarPorId(id);
    }

    @Test
    @DisplayName("GET /api/equipamentos/{id} - Deve retornar status 404 quando ID não existir")
    void deveRetornarNotFoundAoBuscarPorIdInexistente() throws Exception {
        Integer id = 99;
        when(equipamentoService.buscarPorId(id)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/equipamentos/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(equipamentoService, times(1)).buscarPorId(id);
    }

    @Test
    @DisplayName("DELETE /api/equipamentos/{id} - Deve deletar equipamento existente e retornar status 204")
    void deveDeletarEquipamentoComSucesso() throws Exception {
        Integer id = 10;
        when(equipamentoService.deletar(id)).thenReturn(true);

        mockMvc.perform(delete("/api/equipamentos/{id}", id))
                .andExpect(status().isNoContent());

        verify(equipamentoService, times(1)).deletar(id);
    }

    @Test
    @DisplayName("DELETE /api/equipamentos/{id} - Deve retornar status 404 ao tentar deletar ID inexistente")
    void deveRetornarNotFoundAoDeletarIdInexistente() throws Exception {
        Integer id = 99;
        when(equipamentoService.deletar(id)).thenReturn(false);

        mockMvc.perform(delete("/api/equipamentos/{id}", id))
                .andExpect(status().isNotFound());

        verify(equipamentoService, times(1)).deletar(id);
    }

    @Test
    @DisplayName("PUT /api/equipamentos/{id} - Deve atualizar equipamento existente e retornar status 200")
    void deveAtualizarEquipamentoComSucesso() throws Exception {
        Integer id = 10;
        EquipamentoResponseDTO atualizado = new EquipamentoResponseDTO(
                10, "Notebook Atualizado", "PAT-001", 1, "Informática",
                "NOVO", "EM_MANUTENCAO", "Atualizado", LocalDateTime.of(2026, 11, 26, 10, 0)
        );
        when(equipamentoService.atualizar(eq(id), any(EquipamentoRequestDTO.class)))
                .thenReturn(Optional.of(atualizado));

        mockMvc.perform(put("/api/equipamentos/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.nome").value("Notebook Atualizado"))
                .andExpect(jsonPath("$.statusItem").value("EM_MANUTENCAO"));

        verify(equipamentoService, times(1)).atualizar(eq(id), any(EquipamentoRequestDTO.class));
    }

    @Test
    @DisplayName("PUT /api/equipamentos/{id} - Deve retornar status 404 ao tentar atualizar ID inexistente")
    void deveRetornarNotFoundAoAtualizarIdInexistente() throws Exception {
        Integer id = 99;
        when(equipamentoService.atualizar(eq(id), any(EquipamentoRequestDTO.class)))
                .thenReturn(Optional.empty());

        mockMvc.perform(put("/api/equipamentos/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isNotFound());

        verify(equipamentoService, times(1)).atualizar(eq(id), any(EquipamentoRequestDTO.class));
    }
    @Test
    @DisplayName("GET /api/equipamentos - Deve retornar lista vazia com status 200 quando não houver equipamentos")
    void deveRetornarListaVaziaQuandoNaoHouverEquipamentos() throws Exception {
        when(equipamentoService.listarTodos()).thenReturn(List.of());

        mockMvc.perform(get("/api/equipamentos")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(0));

        verify(equipamentoService, times(1)).listarTodos();
    }

    @Test
    @DisplayName("POST /api/equipamentos - Deve retornar status 400 quando payload vier vazio ou inválido (@Valid)")
    void deveRetornarBadRequestAoCriarEquipamentoVazio() throws Exception {
        mockMvc.perform(post("/api/equipamentos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());

        verify(equipamentoService, never()).criar(any());
    }

    @Test
    @DisplayName("PUT /api/equipamentos/{id} - Deve retornar status 400 quando payload vier vazio ou inválido (@Valid)")
    void deveRetornarBadRequestAoAtualizarEquipamentoVazio() throws Exception {
        mockMvc.perform(put("/api/equipamentos/{id}", 10)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());

        verify(equipamentoService, never()).atualizar(any(), any());
    }



}