package com.grupo5.ta_share.service;

import com.grupo5.ta_share.model.Usuario;
import com.grupo5.ta_share.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
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
        usuario.setNome("Maria Souza");
        usuario.setEmail("maria@email.com");
        usuario.setSenha("$2a$10$encryptedPasswordExample"); // Simula senha criptografada
        usuario.setPerfil("ADMIN");
    }

    @Test
    void deveCarregarUserDetailsComSucessoQuandoUsuarioExiste() {

        when(usuarioRepository.findByEmail("maria@email.com")).thenReturn(Optional.of(usuario));


        UserDetails userDetails = userDetailsService.loadUserByUsername("maria@email.com");


        assertNotNull(userDetails);
        assertEquals("maria@email.com", userDetails.getUsername());
        assertEquals("$2a$10$encryptedPasswordExample", userDetails.getPassword());
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));

        verify(usuarioRepository, times(1)).findByEmail("maria@email.com");
    }

    @Test
    void deveLancarUsernameNotFoundExceptionQuandoUsuarioNaoExiste() {

        when(usuarioRepository.findByEmail("inexistente@email.com")).thenReturn(Optional.empty());


        UsernameNotFoundException exception = assertThrows(
                UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("inexistente@email.com")
        );

        assertTrue(exception.getMessage().contains("Usuário não encontrado com o e-mail"));
        verify(usuarioRepository, times(1)).findByEmail("inexistente@email.com");
    }
}