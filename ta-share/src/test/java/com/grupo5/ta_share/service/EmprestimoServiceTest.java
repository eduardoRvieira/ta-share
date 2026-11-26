package com.grupo5.ta_share.service;

import com.grupo5.ta_share.dto.request.EmprestimoRequestDTO;
import com.grupo5.ta_share.dto.response.EmprestimoResponseDTO;
import com.grupo5.ta_share.model.Emprestimo;
import com.grupo5.ta_share.model.Equipamento;
import com.grupo5.ta_share.model.Usuario;
import com.grupo5.ta_share.repository.EmprestimoRepository;
import com.grupo5.ta_share.repository.EquipamentoRepository;
import com.grupo5.ta_share.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmprestimoServiceTest {

    @Mock
    private EmprestimoRepository emprestimoRepository;

    @Mock
    private EquipamentoRepository equipamentoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private EmprestimoService emprestimoService;

    private Usuario usuario;
    private Equipamento equipamento;
    private Emprestimo emprestimo;
    private EmprestimoRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1);
        usuario.setNome("João Silva");

        equipamento = new Equipamento();
        equipamento.setId(10);
        equipamento.setNome("Notebook Dell");
        equipamento.setStatusItem("DISPONIVEL");

        emprestimo = new Emprestimo();
        emprestimo.setId(100);
        emprestimo.setUsuario(usuario);
        emprestimo.setEquipamento(equipamento);
        emprestimo.setDataEmprestimo(LocalDate.of(2026, 11, 20));
        emprestimo.setDataDevolucaoPrevista(LocalDate.of(2026, 11, 27));
        emprestimo.setDataDevolucaoReal(null);
        emprestimo.setStatus("ATIVO");
        emprestimo.setObservacoes("Uso em laboratório");

        requestDTO = new EmprestimoRequestDTO(
                1,
                10,
                LocalDate.of(2026, 11, 20),
                LocalDate.of(2026, 11, 27),
                null,
                "ATIVO",
                "Uso em laboratório"
        );
    }

    @Test
    @DisplayName("Deve listar todos os empréstimos convertidos para DTO")
    void deveListarTodos() {
        when(emprestimoRepository.findAll()).thenReturn(List.of(emprestimo));

        List<EmprestimoResponseDTO> resultado = emprestimoService.listarTodos();

        assertEquals(1, resultado.size());
        assertEquals(100, resultado.get(0).id());
        assertEquals("João Silva", resultado.get(0).usuarioNome());
        assertEquals("Notebook Dell", resultado.get(0).equipamentoNome());
        verify(emprestimoRepository).findAll();
    }

    @Test
    @DisplayName("Deve buscar empréstimo por ID quando existir")
    void deveBuscarPorIdComSucesso() {
        when(emprestimoRepository.findById(100)).thenReturn(Optional.of(emprestimo));

        Optional<EmprestimoResponseDTO> resultado = emprestimoService.buscarPorId(100);

        assertTrue(resultado.isPresent());
        assertEquals(100, resultado.get().id());
    }

    @Test
    @DisplayName("Deve retornar Optional vazio quando empréstimo não existir")
    void deveRetornarVazioQuandoBuscarPorIdInexistente() {
        when(emprestimoRepository.findById(999)).thenReturn(Optional.empty());

        Optional<EmprestimoResponseDTO> resultado = emprestimoService.buscarPorId(999);

        assertTrue(resultado.isEmpty());
    }

    @Test
    @DisplayName("Deve criar empréstimo com sucesso e alterar status do equipamento para EMPRESTADO")
    void deveCriarEmprestimoComSucesso() {
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(equipamentoRepository.findById(10)).thenReturn(Optional.of(equipamento));
        when(emprestimoRepository.save(any(Emprestimo.class))).thenReturn(emprestimo);

        EmprestimoResponseDTO resultado = emprestimoService.criar(requestDTO);

        assertNotNull(resultado);
        assertEquals("EMPRESTADO", equipamento.getStatusItem());
        verify(equipamentoRepository).save(equipamento);
        verify(emprestimoRepository).save(any(Emprestimo.class));
    }

    @Test
    @DisplayName("Deve preencher dataEmprestimo com LocalDate.now() quando vier nula no DTO ao criar")
    void deveCriarEmprestimoComDataAtualQuandoNula() {
        EmprestimoRequestDTO dtoSemData = new EmprestimoRequestDTO(
                1, 10, null, LocalDate.of(2026, 12, 1), null, "ATIVO", "Sem data inicial"
        );
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(equipamentoRepository.findById(10)).thenReturn(Optional.of(equipamento));
        when(emprestimoRepository.save(any(Emprestimo.class))).thenAnswer(inv -> inv.getArgument(0));

        EmprestimoResponseDTO resultado = emprestimoService.criar(dtoSemData);

        assertEquals(LocalDate.now(), resultado.dataEmprestimo());
    }

    @Test
    @DisplayName("Deve lançar 404 ao criar empréstimo com usuário inexistente")
    void deveLancar404QuandoUsuarioNaoEncontradoAoCriar() {
        when(usuarioRepository.findById(1)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> emprestimoService.criar(requestDTO)
        );

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(equipamentoRepository, never()).findById(any());
        verify(emprestimoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar 404 ao criar empréstimo com equipamento inexistente")
    void deveLancar404QuandoEquipamentoNaoEncontradoAoCriar() {
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(equipamentoRepository.findById(10)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> emprestimoService.criar(requestDTO)
        );

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(emprestimoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar 400 ao criar empréstimo quando equipamento já estiver EMPRESTADO")
    void deveLancar400QuandoEquipamentoJaEmprestado() {
        equipamento.setStatusItem("EMPRESTADO");
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(equipamentoRepository.findById(10)).thenReturn(Optional.of(equipamento));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> emprestimoService.criar(requestDTO)
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(emprestimoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar 400 ao criar empréstimo quando equipamento estiver em MANUTENCAO")
    void deveLancar400QuandoEquipamentoEmManutencao() {
        equipamento.setStatusItem("MANUTENCAO");
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        when(equipamentoRepository.findById(10)).thenReturn(Optional.of(equipamento));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> emprestimoService.criar(requestDTO)
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(emprestimoRepository, never()).save(any());
    }
}