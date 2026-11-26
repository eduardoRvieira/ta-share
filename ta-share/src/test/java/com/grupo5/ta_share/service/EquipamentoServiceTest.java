package com.grupo5.ta_share.service;

import com.grupo5.ta_share.dto.request.EquipamentoRequestDTO;
import com.grupo5.ta_share.dto.response.EquipamentoResponseDTO;
import com.grupo5.ta_share.model.Categoria;
import com.grupo5.ta_share.model.Equipamento;
import com.grupo5.ta_share.repository.CategoriaRepository;
import com.grupo5.ta_share.repository.EquipamentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EquipamentoServiceTest {

    @Mock
    private EquipamentoRepository equipamentoRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @InjectMocks
    private EquipamentoService equipamentoService;

    private Categoria categoria;
    private Equipamento equipamento;
    private EquipamentoRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        categoria = new Categoria();
        categoria.setId(1);
        categoria.setNome("Informática");

        equipamento = new Equipamento();
        equipamento.setId(10);
        equipamento.setNome("Notebook Dell");
        equipamento.setPatrimonio("PAT-001");
        equipamento.setCategoria(categoria);
        equipamento.setEstadoConservacao("BOM");
        equipamento.setStatusItem("DISPONIVEL");
        equipamento.setDescricao("Notebook i7 16GB");
        equipamento.setCriadoEm(LocalDateTime.now());

        requestDTO = new EquipamentoRequestDTO(
                "Notebook Dell",
                "PAT-001",
                1,
                "BOM",
                "DISPONIVEL",
                "Notebook i7 16GB"
        );
    }

    @Test
    @DisplayName("Deve listar todos os equipamentos convertidos para DTO")
    void deveListarTodos() {
        when(equipamentoRepository.findAll()).thenReturn(List.of(equipamento));

        List<EquipamentoResponseDTO> resultado = equipamentoService.listarTodos();

        assertEquals(1, resultado.size());
        assertEquals("Notebook Dell", resultado.get(0).nome());
        assertEquals("Informática", resultado.get(0).categoriaNome());
        verify(equipamentoRepository).findAll();
    }

    @Test
    @DisplayName("Deve buscar equipamento por ID quando existir")
    void deveBuscarPorIdComSucesso() {
        when(equipamentoRepository.findById(10)).thenReturn(Optional.of(equipamento));

        Optional<EquipamentoResponseDTO> resultado = equipamentoService.buscarPorId(10);

        assertTrue(resultado.isPresent());
        assertEquals(10, resultado.get().id());
        assertEquals("Notebook Dell", resultado.get().nome());
    }

    @Test
    @DisplayName("Deve retornar Optional vazio quando equipamento não existir")
    void deveRetornarVazioQuandoBuscarPorIdInexistente() {
        when(equipamentoRepository.findById(99)).thenReturn(Optional.empty());

        Optional<EquipamentoResponseDTO> resultado = equipamentoService.buscarPorId(99);

        assertTrue(resultado.isEmpty());
    }

    @Test
    @DisplayName("Deve criar equipamento com sucesso quando categoria existir")
    void deveCriarEquipamentoComSucesso() {
        when(categoriaRepository.findById(1)).thenReturn(Optional.of(categoria));
        when(equipamentoRepository.save(any(Equipamento.class))).thenReturn(equipamento);

        EquipamentoResponseDTO resultado = equipamentoService.criar(requestDTO);

        assertNotNull(resultado);
        assertEquals(10, resultado.id());
        assertEquals("Notebook Dell", resultado.nome());
        assertEquals("Informática", resultado.categoriaNome());
        verify(equipamentoRepository).save(any(Equipamento.class));
    }

    @Test
    @DisplayName("Deve lançar ResponseStatusException 404 ao criar equipamento com categoria inexistente")
    void deveLancarExcecaoAoCriarComCategoriaInexistente() {
        when(categoriaRepository.findById(1)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> equipamentoService.criar(requestDTO)
        );

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(equipamentoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve atualizar equipamento existente com sucesso")
    void deveAtualizarEquipamentoComSucesso() {
        EquipamentoRequestDTO dtoAtualizado = new EquipamentoRequestDTO(
                "Notebook Atualizado", "PAT-001", 1, "NOVO", "EM_MANUTENCAO", "Atualizado"
        );

        when(equipamentoRepository.findById(10)).thenReturn(Optional.of(equipamento));
        when(categoriaRepository.findById(1)).thenReturn(Optional.of(categoria));
        when(equipamentoRepository.save(any(Equipamento.class))).thenReturn(equipamento);

        Optional<EquipamentoResponseDTO> resultado = equipamentoService.atualizar(10, dtoAtualizado);

        assertTrue(resultado.isPresent());
        assertEquals("Notebook Atualizado", resultado.get().nome());
        assertEquals("EM_MANUTENCAO", resultado.get().statusItem());
        verify(equipamentoRepository).save(equipamento);
    }

    @Test
    @DisplayName("Deve retornar Optional vazio ao tentar atualizar equipamento inexistente")
    void deveRetornarVazioAoAtualizarEquipamentoInexistente() {
        when(equipamentoRepository.findById(99)).thenReturn(Optional.empty());

        Optional<EquipamentoResponseDTO> resultado = equipamentoService.atualizar(99, requestDTO);

        assertTrue(resultado.isEmpty());
        verify(categoriaRepository, never()).findById(any());
        verify(equipamentoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar ResponseStatusException 404 ao atualizar equipamento com categoria inexistente")
    void deveLancarExcecaoAoAtualizarComCategoriaInexistente() {
        when(equipamentoRepository.findById(10)).thenReturn(Optional.of(equipamento));
        when(categoriaRepository.findById(1)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> equipamentoService.atualizar(10, requestDTO)
        );

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(equipamentoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve deletar equipamento existente e retornar true")
    void deveDeletarComSucesso() {
        when(equipamentoRepository.existsById(10)).thenReturn(true);

        boolean deletado = equipamentoService.deletar(10);

        assertTrue(deletado);
        verify(equipamentoRepository).deleteById(10);
    }

    @Test
    @DisplayName("Deve retornar false ao tentar deletar equipamento inexistente")
    void deveRetornarFalseAoDeletarInexistente() {
        when(equipamentoRepository.existsById(99)).thenReturn(false);

        boolean deletado = equipamentoService.deletar(99);

        assertFalse(deletado);
        verify(equipamentoRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Deve converter para DTO com categoria nula sem lançar NullPointerException")
    void deveConverterParaDtoComCategoriaNula() {
        equipamento.setCategoria(null);

        EquipamentoResponseDTO dto = equipamentoService.toResponseDTO(equipamento);

        assertNull(dto.categoriaId());
        assertNull(dto.categoriaNome());
        assertEquals("Notebook Dell", dto.nome());
    }
}