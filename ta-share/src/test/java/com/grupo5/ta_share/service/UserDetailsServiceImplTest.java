package com.grupo5.ta_share.service;

import com.grupo5.ta_share.model.Usuario;
import com.grupo5.ta_share.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1);
        usuario.setNome("João Silva");
        usuario.setEmail("joao@email.com");
        usuario.setSenha("$2a$10$senhaCriptografada");
        usuario.setPerfil("ADMIN");
    }

    @Test
    @DisplayName("Deve carregar UserDetails com perfil definido quando e-mail existir")
    void deveCarregarUsuarioPorEmailComSucesso() {
        when(usuarioRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(usuario));

        UserDetails userDetails = userDetailsService.loadUserByUsername("joao@email.com");

        assertNotNull(userDetails);
        assertEquals("joao@email.com", userDetails.getUsername());
        assertEquals("$2a$10$senhaCriptografada", userDetails.getPassword());
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN")));
        verify(usuarioRepository).findByEmail("joao@email.com");
    }

    @Test
    @DisplayName("Deve atribuir role ROLE_COMUM quando o perfil do usuário for nulo")
    void deveAtribuirRoleComumQuandoPerfilForNulo() {
        usuario.setPerfil(null);
        when(usuarioRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(usuario));

        UserDetails userDetails = userDetailsService.loadUserByUsername("joao@email.com");

        assertNotNull(userDetails);
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_COMUM")));
        verify(usuarioRepository).findByEmail("joao@email.com");
    }

    @Test
    @DisplayName("Deve lançar UsernameNotFoundException quando e-mail não for encontrado")
    void deveLancarExcecaoQuandoEmailNaoEncontrado() {
        String emailInexistente = "naoexiste@email.com";
        when(usuarioRepository.findByEmail(emailInexistente)).thenReturn(Optional.empty());

        UsernameNotFoundException ex = assertThrows(
                UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername(emailInexistente)
        );

        assertEquals("Usuário não encontrado com o e-mail: " + emailInexistente, ex.getMessage());
        verify(usuarioRepository).findByEmail(emailInexistente);
    }
}