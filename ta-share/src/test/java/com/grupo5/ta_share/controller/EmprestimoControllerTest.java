package com.grupo5.ta_share.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grupo5.ta_share.dto.request.EmprestimoRequestDTO;
import com.grupo5.ta_share.dto.response.EmprestimoResponseDTO;
import com.grupo5.ta_share.service.EmprestimoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EmprestimoController.class)
@AutoConfigureMockMvc(addFilters = false)
class EmprestimoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EmprestimoService emprestimoService;

    private EmprestimoRequestDTO requestDTO;
    private EmprestimoResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        requestDTO = new EmprestimoRequestDTO(
                1,
                10,
                LocalDate.of(2026, 11, 20),
                LocalDate.of(2026, 11, 27),
                null,
                "ATIVO",
                "Uso em laboratório"
        );

        responseDTO = new EmprestimoResponseDTO(
                100,
                1,
                "João Silva",
                10,
                "Notebook Dell",
                LocalDate.of(2026, 11, 20),
                LocalDate.of(2026, 11, 27),
                null,
                "ATIVO",
                "Uso em laboratório"
        );
    }

    @Test
    @DisplayName("GET /api/emprestimos - Deve retornar lista de empréstimos com status 200")
    void deveListarTodosOsEmprestimos() throws Exception {
        when(emprestimoService.listarTodos()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/emprestimos")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value(100))
                .andExpect(jsonPath("$[0].usuarioNome").value("João Silva"));

        verify(emprestimoService, times(1)).listarTodos();
    }

    @Test
    @DisplayName("POST /api/emprestimos - Deve criar empréstimo e retornar status 201")
    void deveCriarEmprestimoComSucesso() throws Exception {
        when(emprestimoService.criar(any(EmprestimoRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/api/emprestimos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.status").value("ATIVO"));

        verify(emprestimoService, times(1)).criar(any(EmprestimoRequestDTO.class));
    }

    @Test
    @DisplayName("GET /api/emprestimos/{id} - Deve retornar empréstimo quando ID existir (status 200)")
    void deveBuscarPorIdComSucesso() throws Exception {
        Integer id = 100;
        when(emprestimoService.buscarPorId(id)).thenReturn(Optional.of(responseDTO));

        mockMvc.perform(get("/api/emprestimos/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));

        verify(emprestimoService, times(1)).buscarPorId(id);
    }

    @Test
    @DisplayName("GET /api/emprestimos/{id} - Deve retornar status 404 quando ID não existir")
    void deveRetornarNotFoundAoBuscarPorIdInexistente() throws Exception {
        Integer id = 999;
        when(emprestimoService.buscarPorId(id)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/emprestimos/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(emprestimoService, times(1)).buscarPorId(id);
    }

    @Test
    @DisplayName("DELETE /api/emprestimos/{id} - Deve deletar empréstimo e retornar status 204")
    void deveDeletarEmprestimoComSucesso() throws Exception {
        Integer id = 100;
        when(emprestimoService.deletar(id)).thenReturn(true);

        mockMvc.perform(delete("/api/emprestimos/{id}", id))
                .andExpect(status().isNoContent());

        verify(emprestimoService, times(1)).deletar(id);
    }

    @Test
    @DisplayName("DELETE /api/emprestimos/{id} - Deve retornar status 404 ao tentar deletar ID inexistente")
    void deveRetornarNotFoundAoDeletarIdInexistente() throws Exception {
        Integer id = 999;
        when(emprestimoService.deletar(id)).thenReturn(false);

        mockMvc.perform(delete("/api/emprestimos/{id}", id))
                .andExpect(status().isNotFound());

        verify(emprestimoService, times(1)).deletar(id);
    }

    @Test
    @DisplayName("PUT /api/emprestimos/{id} - Deve atualizar empréstimo existente e retornar status 200")
    void deveAtualizarEmprestimoComSucesso() throws Exception {
        Integer id = 100;
        when(emprestimoService.atualizar(eq(id), any(EmprestimoRequestDTO.class)))
                .thenReturn(Optional.of(responseDTO));

        mockMvc.perform(put("/api/emprestimos/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));

        verify(emprestimoService, times(1)).atualizar(eq(id), any(EmprestimoRequestDTO.class));
    }

    @Test
    @DisplayName("PUT /api/emprestimos/{id} - Deve retornar status 404 ao tentar atualizar ID inexistente")
    void deveRetornarNotFoundAoAtualizarIdInexistente() throws Exception {
        Integer id = 999;
        when(emprestimoService.atualizar(eq(id), any(EmprestimoRequestDTO.class)))
                .thenReturn(Optional.empty());

        mockMvc.perform(put("/api/emprestimos/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isNotFound());

        verify(emprestimoService, times(1)).atualizar(eq(id), any(EmprestimoRequestDTO.class));
    }
}