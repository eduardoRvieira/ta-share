package com.grupo5.ta_share.service;

import com.grupo5.ta_share.model.Emprestimo;
import com.grupo5.ta_share.model.Equipamento;
import com.grupo5.ta_share.repository.EmprestimoRepository;
import com.grupo5.ta_share.repository.EquipamentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
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

    @InjectMocks
    private EmprestimoService emprestimoService;

    private Equipamento equipamento;

    @BeforeEach
    void setUp() {
        equipamento = new Equipamento();
        equipamento.setId(1);
        equipamento.setStatusItem("DISPONIVEL");
    }

    @Test
    void deveEmprestarQuandoEquipamentoEstiverDisponivel() {
        Emprestimo novoEmprestimo = new Emprestimo();
        novoEmprestimo.setEquipamento(equipamento);

        when(equipamentoRepository.findById(1)).thenReturn(Optional.of(equipamento));
        when(emprestimoRepository.save(any(Emprestimo.class))).thenAnswer(inv -> inv.getArgument(0));

        Emprestimo salvo = emprestimoService.salvar(novoEmprestimo);

        assertNotNull(salvo);
        assertEquals("EMPRESTADO", equipamento.getStatusItem());
        verify(emprestimoRepository, times(1)).save(novoEmprestimo);
    }

    @Test
    void deveBarrarQuandoEquipamentoEstiverEmManutencao() {
        equipamento.setStatusItem("MANUTENCAO");

        Emprestimo novoEmprestimo = new Emprestimo();
        novoEmprestimo.setEquipamento(equipamento);

        when(equipamentoRepository.findById(1)).thenReturn(Optional.of(equipamento));

        ResponseStatusException erro = assertThrows(ResponseStatusException.class, () -> {
            emprestimoService.salvar(novoEmprestimo);
        });

        assertEquals(HttpStatus.BAD_REQUEST, erro.getStatusCode());
        verify(emprestimoRepository, never()).save(any());
    }

    @Test
    void deveLiberarEquipamentoNaDevolucao() {
        equipamento.setStatusItem("EMPRESTADO");

        Emprestimo emprestimoDevolvido = new Emprestimo();
        emprestimoDevolvido.setId(10);
        emprestimoDevolvido.setEquipamento(equipamento);
        emprestimoDevolvido.setDataEmprestimo(LocalDate.now().minusDays(3));
        emprestimoDevolvido.setStatus("DEVOLVIDO");

        when(equipamentoRepository.findById(1)).thenReturn(Optional.of(equipamento));
        when(emprestimoRepository.save(any(Emprestimo.class))).thenAnswer(inv -> inv.getArgument(0));

        Emprestimo atualizado = emprestimoService.salvar(emprestimoDevolvido);

        assertEquals("DISPONIVEL", equipamento.getStatusItem());
        assertEquals(LocalDate.now(), atualizado.getDataDevolucaoReal());
        verify(equipamentoRepository, times(1)).save(equipamento);
        verify(emprestimoRepository, times(1)).save(emprestimoDevolvido);

    }
    @Test
    void deveBarrarQuandoEquipamentoJaEstiverEmprestado() {
        equipamento.setStatusItem("EMPRESTADO");

        Emprestimo novoEmprestimo = new Emprestimo();
        novoEmprestimo.setEquipamento(equipamento);

        when(equipamentoRepository.findById(1)).thenReturn(Optional.of(equipamento));

        ResponseStatusException erro = assertThrows(ResponseStatusException.class, () -> {
            emprestimoService.salvar(novoEmprestimo);
        });

        assertEquals(HttpStatus.BAD_REQUEST, erro.getStatusCode());
        verify(emprestimoRepository, never()).save(any());
    }
}