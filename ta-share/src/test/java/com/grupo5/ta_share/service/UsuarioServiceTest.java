package com.grupo5.ta_share.service;

import com.grupo5.ta_share.dto.request.UsuarioRequestDTO;
import com.grupo5.ta_share.dto.response.UsuarioResponseDTO;
import com.grupo5.ta_share.model.Usuario;
import com.grupo5.ta_share.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    private Usuario usuario;
    private UsuarioRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1);
        usuario.setNome("João Silva");
        usuario.setEmail("joao@email.com");
        usuario.setSenha("$2a$10$senhaCriptografada");
        usuario.setCpf("12345678900");
        usuario.setTelefone("47999999999");
        usuario.setPerfil("CLIENTE");
        usuario.setCriadoEms(LocalDateTime.now());

        requestDTO = new UsuarioRequestDTO(
                "João Silva",
                "joao@email.com",
                "senha123",
                "12345678900",
                "47999999999",
                "CLIENTE"
        );
    }

    @Test
    @DisplayName("Deve listar todos os usuários convertidos para DTO")
    void deveListarTodos() {
        when(usuarioRepository.findAll()).thenReturn(List.of(usuario));

        List<UsuarioResponseDTO> resultado = usuarioService.listarTodos();

        assertEquals(1, resultado.size());
        assertEquals("João Silva", resultado.get(0).nome());
        verify(usuarioRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Deve buscar usuário por ID quando existir")
    void deveBuscarPorIdComSucesso() {
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));

        Optional<UsuarioResponseDTO> resultado = usuarioService.buscarPorId(1);

        assertTrue(resultado.isPresent());
        assertEquals("joao@email.com", resultado.get().email());
    }

    @Test
    @DisplayName("Deve retornar Optional vazio quando ID não existir")
    void deveRetornarVazioQuandoBuscarPorIdInexistente() {
        when(usuarioRepository.findById(99)).thenReturn(Optional.empty());

        Optional<UsuarioResponseDTO> resultado = usuarioService.buscarPorId(99);

        assertTrue(resultado.isEmpty());
    }

    @Test
    @DisplayName("Deve criar usuário criptografando a senha")
    void deveCriarUsuarioComSenhaCriptografada() {
        when(passwordEncoder.encode("senha123")).thenReturn("$2a$10$senhaCriptografada");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        UsuarioResponseDTO resultado = usuarioService.criar(requestDTO);

        assertNotNull(resultado);
        assertEquals("João Silva", resultado.nome());
        verify(passwordEncoder).encode("senha123");
        verify(usuarioRepository).save(any(Usuario.class));
    }

    @Test
    @DisplayName("Deve atualizar usuário e criptografar nova senha quando não começar com $2a$")
    void deveAtualizarUsuarioComNovaSenha() {
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.encode("senha123")).thenReturn("$2a$10$novaSenhaHash");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        Optional<UsuarioResponseDTO> resultado = usuarioService.atualizar(1, requestDTO);

        assertTrue(resultado.isPresent());
        assertEquals("$2a$10$novaSenhaHash", usuario.getSenha());
        verify(passwordEncoder).encode("senha123");
        verify(usuarioRepository).save(usuario);
    }

    @Test
    @DisplayName("Não deve recriptografar senha se ela já vier no formato BCrypt ($2a$)")
    void naoDeveRecriptografarSenhaJaCriptografada() {
        UsuarioRequestDTO dtoComHash = new UsuarioRequestDTO(
                "João Silva", "joao@email.com", "$2a$10$jaCriptografada",
                "12345678900", "47999999999", "CLIENTE"
        );
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        usuarioService.atualizar(1, dtoComHash);

        verify(passwordEncoder, never()).encode(any());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    @DisplayName("Não deve alterar a senha atual quando a senha no DTO vier null")
    void naoDeveAlterarSenhaQuandoVierNula() {
        UsuarioRequestDTO dtoSemSenha = new UsuarioRequestDTO(
                "João Atualizado", "joao@email.com", null,
                "12345678900", "47999999999", "CLIENTE"
        );
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        Optional<UsuarioResponseDTO> resultado = usuarioService.atualizar(1, dtoSemSenha);

        assertTrue(resultado.isPresent());
        assertEquals("$2a$10$senhaCriptografada", usuario.getSenha());
        verify(passwordEncoder, never()).encode(any());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    @DisplayName("Não deve alterar a senha atual quando a senha no DTO vier em branco")
    void naoDeveAlterarSenhaQuandoVierEmBranco() {
        UsuarioRequestDTO dtoSenhaEmBranco = new UsuarioRequestDTO(
                "João Atualizado", "joao@email.com", "   ",
                "12345678900", "47999999999", "CLIENTE"
        );
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        Optional<UsuarioResponseDTO> resultado = usuarioService.atualizar(1, dtoSenhaEmBranco);

        assertTrue(resultado.isPresent());
        assertEquals("$2a$10$senhaCriptografada", usuario.getSenha());
        verify(passwordEncoder, never()).encode(any());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    @DisplayName("Deve retornar Optional vazio ao tentar atualizar ID inexistente")
    void deveRetornarVazioAoAtualizarInexistente() {
        when(usuarioRepository.findById(99)).thenReturn(Optional.empty());

        Optional<UsuarioResponseDTO> resultado = usuarioService.atualizar(99, requestDTO);

        assertTrue(resultado.isEmpty());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve deletar usuário existente e retornar true")
    void deveDeletarComSucesso() {
        when(usuarioRepository.existsById(1)).thenReturn(true);

        boolean deletado = usuarioService.deletar(1);

        assertTrue(deletado);
        verify(usuarioRepository).deleteById(1);
    }

    @Test
    @DisplayName("Deve retornar false ao tentar deletar usuário inexistente")
    void deveRetornarFalseAoDeletarInexistente() {
        when(usuarioRepository.existsById(99)).thenReturn(false);

        boolean deletado = usuarioService.deletar(99);

        assertFalse(deletado);
        verify(usuarioRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Deve retornar entidade Usuario quando ID existir")
    void deveBuscarEntidadePorIdComSucesso() {
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));

        Usuario resultado = usuarioService.buscarEntidadePorId(1);

        assertEquals(1, resultado.getId());
    }

    @Test
    @DisplayName("Deve lançar ResponseStatusException 404 quando entidade não existir")
    void deveLancarExcecaoQuandoEntidadeNaoEncontrada() {
        when(usuarioRepository.findById(99)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> usuarioService.buscarEntidadePorId(99)
        );

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }
}