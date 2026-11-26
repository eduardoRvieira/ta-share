package com.grupo5.ta_share.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grupo5.ta_share.dto.request.CategoriaRequestDTO;
import com.grupo5.ta_share.dto.response.CategoriaResponseDTO;
import com.grupo5.ta_share.service.CategoriaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CategoriaController.class)
@AutoConfigureMockMvc(addFilters = false)
class CategoriaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CategoriaService categoriaService;

    private CategoriaRequestDTO requestDTO;
    private CategoriaResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        requestDTO = new CategoriaRequestDTO(
                "Informática",
                "Notebooks, periféricos e acessórios"
        );

        responseDTO = new CategoriaResponseDTO(
                1,
                "Informática",
                "Notebooks, periféricos e acessórios"
        );
    }

    @Test
    @DisplayName("GET /api/categorias - Deve listar todas as categorias e retornar status 200")
    void deveListarTodasAsCategorias() throws Exception {
        when(categoriaService.listarTodas()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/categorias")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].nome").value("Informática"))
                .andExpect(jsonPath("$[0].descricao").value("Notebooks, periféricos e acessórios"));

        verify(categoriaService, times(1)).listarTodas();
    }

    @Test
    @DisplayName("POST /api/categorias - Deve criar categoria válida e retornar status 201")
    void deveCriarCategoriaComSucesso() throws Exception {
        when(categoriaService.criar(any(CategoriaRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/api/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("Informática"))
                .andExpect(jsonPath("$.descricao").value("Notebooks, periféricos e acessórios"));

        verify(categoriaService, times(1)).criar(any(CategoriaRequestDTO.class));
    }

    @Test
    @DisplayName("POST /api/categorias - Deve retornar status 400 quando dados forem inválidos (@Valid)")
    void deveRetornarBadRequestAoCriarCategoriaInvalida() throws Exception {
        CategoriaRequestDTO dtoInvalido = new CategoriaRequestDTO("", "");

        mockMvc.perform(post("/api/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dtoInvalido)))
                .andExpect(status().isBadRequest());

        verify(categoriaService, never()).criar(any());
    }

    @Test
    @DisplayName("GET /api/categorias/{id} - Deve retornar categoria quando ID existir (status 200)")
    void deveBuscarPorIdComSucesso() throws Exception {
        Integer id = 1;
        when(categoriaService.buscarPorId(id)).thenReturn(Optional.of(responseDTO));

        mockMvc.perform(get("/api/categorias/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.nome").value("Informática"));

        verify(categoriaService, times(1)).buscarPorId(id);
    }

    @Test
    @DisplayName("GET /api/categorias/{id} - Deve retornar status 404 quando ID não existir")
    void deveRetornarNotFoundAoBuscarPorIdInexistente() throws Exception {
        Integer id = 99;
        when(categoriaService.buscarPorId(id)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/categorias/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(categoriaService, times(1)).buscarPorId(id);
    }

    @Test
    @DisplayName("DELETE /api/categorias/{id} - Deve deletar categoria existente e retornar status 204")
    void deveDeletarCategoriaComSucesso() throws Exception {
        Integer id = 1;
        when(categoriaService.deletar(id)).thenReturn(true);

        mockMvc.perform(delete("/api/categorias/{id}", id))
                .andExpect(status().isNoContent());

        verify(categoriaService, times(1)).deletar(id);
    }

    @Test
    @DisplayName("DELETE /api/categorias/{id} - Deve retornar status 404 ao tentar deletar ID inexistente")
    void deveRetornarNotFoundAoDeletarIdInexistente() throws Exception {
        Integer id = 99;
        when(categoriaService.deletar(id)).thenReturn(false);

        mockMvc.perform(delete("/api/categorias/{id}", id))
                .andExpect(status().isNotFound());

        verify(categoriaService, times(1)).deletar(id);
    }

    @Test
    @DisplayName("PUT /api/categorias/{id} - Deve atualizar categoria existente e retornar status 200")
    void deveAtualizarCategoriaComSucesso() throws Exception {
        Integer id = 1;
        CategoriaResponseDTO atualizado = new CategoriaResponseDTO(1, "Audiovisual", "Projetores e câmeras");
        when(categoriaService.atualizar(eq(id), any(CategoriaRequestDTO.class)))
                .thenReturn(Optional.of(atualizado));

        mockMvc.perform(put("/api/categorias/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.nome").value("Audiovisual"));

        verify(categoriaService, times(1)).atualizar(eq(id), any(CategoriaRequestDTO.class));
    }

    @Test
    @DisplayName("PUT /api/categorias/{id} - Deve retornar status 404 ao tentar atualizar ID inexistente")
    void deveRetornarNotFoundAoAtualizarIdInexistente() throws Exception {
        Integer id = 99;
        when(categoriaService.atualizar(eq(id), any(CategoriaRequestDTO.class)))
                .thenReturn(Optional.empty());

        mockMvc.perform(put("/api/categorias/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isNotFound());

        verify(categoriaService, times(1)).atualizar(eq(id), any(CategoriaRequestDTO.class));
    }

    @Test
    @DisplayName("PUT /api/categorias/{id} - Deve retornar status 400 quando dados de atualização forem inválidos (@Valid)")
    void deveRetornarBadRequestAoAtualizarCategoriaInvalida() throws Exception {
        CategoriaRequestDTO dtoInvalido = new CategoriaRequestDTO("", "");

        mockMvc.perform(put("/api/categorias/{id}", 1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dtoInvalido)))
                .andExpect(status().isBadRequest());

        verify(categoriaService, never()).atualizar(any(), any());
    }
}