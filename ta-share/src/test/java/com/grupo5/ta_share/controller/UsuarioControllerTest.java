package com.grupo5.ta_share.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grupo5.ta_share.model.Usuario;
import com.grupo5.ta_share.service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
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


@AutoConfigureMockMvc(addFilters = false) //Ignorar Spring Security.
@WebMvcTest(UsuarioController.class)
class UsuarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UsuarioService usuarioService; // Mocka o service para isolar o controller

    @Autowired
    private ObjectMapper objectMapper; // Usado para converter objetos em JSON

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1);
        usuario.setNome("João Silva");
        usuario.setEmail("joao@email.com");
        usuario.setSenha("Senha123");
        usuario.setCpf("111.444.777-35"); // Coloque um CPF formatado que passe na anotação @CPF.
        usuario.setPerfil("Cliente");
    }

    @Test
    void deveListarTodosOsUsuariosComSucesso() throws Exception {
        when(usuarioService.listarTodos()).thenReturn(List.of(usuario));

        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].nome").value("João Silva"))
                .andExpect(jsonPath("$[0].email").value("joao@email.com"));

        verify(usuarioService, times(1)).listarTodos();
    }

    @Test
    void deveBuscarUsuarioPorIdComSucesso() throws Exception {
        when(usuarioService.buscarPorId(1)).thenReturn(Optional.of(usuario));

        mockMvc.perform(get("/api/usuarios/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("João Silva"));

        verify(usuarioService, times(1)).buscarPorId(1);
    }

    @Test
    void deveRetornarNotFoundAoBuscarIdInexistente() throws Exception {
        when(usuarioService.buscarPorId(99)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/usuarios/99"))
                .andExpect(status().isNotFound());

        verify(usuarioService, times(1)).buscarPorId(99);
    }

    @Test
    void deveCriarNovoUsuarioComSucesso() throws Exception {
        when(usuarioService.salvar(any(Usuario.class))).thenReturn(usuario);

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(usuario)))
                .andExpect(status().isOk()) // Ou isCreated() se ajustado no controller
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("João Silva"));

        verify(usuarioService, times(1)).salvar(any(Usuario.class));
    }

    @Test
    void deveDeletarUsuarioComSucesso() throws Exception {
        when(usuarioService.buscarPorId(1)).thenReturn(Optional.of(usuario));
        doNothing().when(usuarioService).deletar(1);

        mockMvc.perform(delete("/api/usuarios/1"))
                .andExpect(status().isNoContent());

        verify(usuarioService, times(1)).deletar(1);
    }

    @Test
    void deveRetornarNotFoundAoTentarDeletarIdInexistente() throws Exception {
        when(usuarioService.buscarPorId(99)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/usuarios/99"))
                .andExpect(status().isNotFound());

        verify(usuarioService, never()).deletar(any());
    }

    @Test
    void deveAtualizarUsuarioComSucesso() throws Exception {
        when(usuarioService.buscarPorId(1)).thenReturn(Optional.of(usuario));
        when(usuarioService.salvar(any(Usuario.class))).thenReturn(usuario);

        mockMvc.perform(put("/api/usuarios/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(usuario)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));

        verify(usuarioService, times(1)).salvar(any(Usuario.class));
    }

    @Test
    void deveRetornarNotFoundAoTentarAtualizarIdInexistente() throws Exception {
        when(usuarioService.buscarPorId(99)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/usuarios/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(usuario)))
                .andExpect(status().isNotFound());

        verify(usuarioService, never()).salvar(any());
    }
}