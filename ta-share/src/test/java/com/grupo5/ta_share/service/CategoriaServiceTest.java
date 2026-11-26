package com.grupo5.ta_share.service;

import com.grupo5.ta_share.dto.request.CategoriaRequestDTO;
import com.grupo5.ta_share.dto.response.CategoriaResponseDTO;
import com.grupo5.ta_share.model.Categoria;
import com.grupo5.ta_share.repository.CategoriaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoriaServiceTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @InjectMocks
    private CategoriaService categoriaService;

    private Categoria categoria;
    private CategoriaRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        categoria = new Categoria();
        categoria.setId(1);
        categoria.setNome("Informática");
        categoria.setDescricao("Notebooks, periféricos e acessórios");

        requestDTO = new CategoriaRequestDTO(
                "Informática",
                "Notebooks, periféricos e acessórios"
        );
    }

    @Test
    @DisplayName("Deve listar todas as categorias convertidas para DTO")
    void deveListarTodas() {
        when(categoriaRepository.findAll()).thenReturn(List.of(categoria));

        List<CategoriaResponseDTO> resultado = categoriaService.listarTodas();

        assertEquals(1, resultado.size());
        assertEquals(1, resultado.get(0).id());
        assertEquals("Informática", resultado.get(0).nome());
        assertEquals("Notebooks, periféricos e acessórios", resultado.get(0).descricao());
        verify(categoriaRepository).findAll();
    }

    @Test
    @DisplayName("Deve buscar categoria por ID quando existir")
    void deveBuscarPorIdComSucesso() {
        when(categoriaRepository.findById(1)).thenReturn(Optional.of(categoria));

        Optional<CategoriaResponseDTO> resultado = categoriaService.buscarPorId(1);

        assertTrue(resultado.isPresent());
        assertEquals(1, resultado.get().id());
        assertEquals("Informática", resultado.get().nome());
        verify(categoriaRepository).findById(1);
    }

    @Test
    @DisplayName("Deve retornar Optional vazio quando categoria não existir")
    void deveRetornarVazioQuandoBuscarPorIdInexistente() {
        when(categoriaRepository.findById(99)).thenReturn(Optional.empty());

        Optional<CategoriaResponseDTO> resultado = categoriaService.buscarPorId(99);

        assertTrue(resultado.isEmpty());
        verify(categoriaRepository).findById(99);
    }

    @Test
    @DisplayName("Deve criar categoria e retornar DTO correspondente")
    void deveCriarCategoriaComSucesso() {
        when(categoriaRepository.save(any(Categoria.class))).thenReturn(categoria);

        CategoriaResponseDTO resultado = categoriaService.criar(requestDTO);

        assertNotNull(resultado);
        assertEquals(1, resultado.id());
        assertEquals("Informática", resultado.nome());
        assertEquals("Notebooks, periféricos e acessórios", resultado.descricao());
        verify(categoriaRepository).save(any(Categoria.class));
    }

    @Test
    @DisplayName("Deve atualizar categoria existente e retornar DTO atualizado")
    void deveAtualizarCategoriaComSucesso() {
        CategoriaRequestDTO dtoAtualizado = new CategoriaRequestDTO(
                "Audiovisual",
                "Projetores, câmeras e microfones"
        );
        when(categoriaRepository.findById(1)).thenReturn(Optional.of(categoria));
        when(categoriaRepository.save(any(Categoria.class))).thenReturn(categoria);

        Optional<CategoriaResponseDTO> resultado = categoriaService.atualizar(1, dtoAtualizado);

        assertTrue(resultado.isPresent());
        assertEquals("Audiovisual", resultado.get().nome());
        assertEquals("Projetores, câmeras e microfones", resultado.get().descricao());
        verify(categoriaRepository).save(categoria);
    }

    @Test
    @DisplayName("Deve retornar Optional vazio ao tentar atualizar categoria inexistente")
    void deveRetornarVazioAoAtualizarInexistente() {
        when(categoriaRepository.findById(99)).thenReturn(Optional.empty());

        Optional<CategoriaResponseDTO> resultado = categoriaService.atualizar(99, requestDTO);

        assertTrue(resultado.isEmpty());
        verify(categoriaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve deletar categoria existente e retornar true")
    void deveDeletarComSucesso() {
        when(categoriaRepository.existsById(1)).thenReturn(true);

        boolean deletado = categoriaService.deletar(1);

        assertTrue(deletado);
        verify(categoriaRepository).deleteById(1);
    }

    @Test
    @DisplayName("Deve retornar false ao tentar deletar categoria inexistente")
    void deveRetornarFalseAoDeletarInexistente() {
        when(categoriaRepository.existsById(99)).thenReturn(false);

        boolean deletado = categoriaService.deletar(99);

        assertFalse(deletado);
        verify(categoriaRepository, never()).deleteById(any());
    }
}