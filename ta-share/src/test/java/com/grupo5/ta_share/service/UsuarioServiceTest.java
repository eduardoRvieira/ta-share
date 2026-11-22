package com.grupo5.ta_share.service;

import com.grupo5.ta_share.model.Usuario;
import com.grupo5.ta_share.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

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

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1);
        usuario.setNome("Usuário Teste");
        usuario.setEmail("teste@email.com");
        usuario.setSenha("senha123");

    }

    @Test
    void deveListarTodosOsUsuarios() {

        when(usuarioRepository.findAll()).thenReturn(List.of(usuario));

        List<Usuario> resultado = usuarioService.listarTodos();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(usuarioRepository, times(1)).findAll();

    }

    @Test
    void deveBuscarUsuarioPorId() {
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));

        Optional<Usuario> resultado = usuarioService.buscarPorId(1);

        assertTrue(resultado.isPresent());
        assertEquals(1, resultado.get().getId());
        verify(usuarioRepository, times(1)).findById(1);

    }

    @Test
    void deveSalvarNovoUsuarioComSenhaCriptografadaEDataCriacao() {
        Usuario novoUsuario = new Usuario();
        novoUsuario.setSenha("minhasenha123");

        when(passwordEncoder.encode("minhasenha123")).thenReturn("$2a$10$encryptedHashMock");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario salvo = usuarioService.salvar(novoUsuario);

        assertNotNull(salvo);
        assertEquals("$2a$10$encryptedHashMock", salvo.getSenha(), "A senha deveria ter sido criptografada.");
        assertNotNull(salvo.getCriadoEms(), "A data de criação deveria ter sido preenchida automaticamente.");
        verify(passwordEncoder, times(1)).encode("minhasenha123");
        verify(usuarioRepository, times(1)).save(novoUsuario);

    }

    @Test
    void naoDeveReCriptografarSenhaSeJaEstiverCriptografada() {
        // Senha já começa com "$2a$" simulando que já foi codificada antes
        usuario.setSenha("$2a$10$alreadyEncryptedHash");

        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario salvo = usuarioService.salvar(usuario);

        assertNotNull(salvo);
        assertEquals("$2a$10$alreadyEncryptedHash", salvo.getSenha(), "A senha criptografada não deveria ser alterada.");
        verify(passwordEncoder, never()).encode(any()); // Garante que o encoder NÃO foi chamado
        verify(usuarioRepository, times(1)).save(usuario);

    }

    @Test
    void deveDeletarUsuarioPorId() {
        doNothing().when(usuarioRepository).deleteById(1);

        usuarioService.deletar(1);

        verify(usuarioRepository, times(1)).deleteById(1);

    }
}