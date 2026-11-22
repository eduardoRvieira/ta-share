package com.grupo5.ta_share.service;

import com.grupo5.ta_share.model.Equipamento;
import com.grupo5.ta_share.repository.EquipamentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static com.sun.org.apache.xalan.internal.lib.ExsltDatetime.time;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EquipamentoServiceTest {

    @Mock
    private EquipamentoRepository equipamentoRepository;

    @InjectMocks
    private EquipamentoService equipamentoService;
    private Equipamento equipamento;

    @BeforeEach
    void SetUp(){
        equipamento = new Equipamento();
        equipamento.setId(1);
        equipamento.setStatusItem("DISPONMIVEL");
    }

    @Test
    void deveListarTodosOsEquipamentos(){

        when(equipamentoRepository.findAll()).thenReturn(List.of(equipamento));

        List<Equipamento> resultado = equipamentoService.listarTodos();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(equipamentoRepository, times(1)).findAll();

    }
    @Test
    void deveBuscarEquipamentoPorId() {
        when(equipamentoRepository.findById(1)).thenReturn(Optional.of(equipamento));

        Optional<Equipamento> resultado = equipamentoService.buscarPorId(1);

        assertTrue(resultado.isPresent());
        assertEquals(1, resultado.get().getId());
        verify(equipamentoRepository, times(1)).findById(1);
    }
    @Test
    void deveSalvarNovoEquipamentoEPreencherDataCriacao() {
        Equipamento novoEquipamento = new Equipamento();

        when(equipamentoRepository.save(any(Equipamento.class))).thenAnswer(inv -> inv.getArgument(0));

        Equipamento salvo = equipamentoService.salvar(novoEquipamento);

        assertNotNull(salvo);
        assertNotNull(salvo.getCriadoEm(), "A data de criação deveria ter sido preenchida automaticamente.");
        verify(equipamentoRepository, times(1)).save(novoEquipamento);
    }
    @Test
    void deveSalvarEquipamentoExistenteSemAlterarDataCriacao() {
        LocalDateTime dataAntiga = LocalDateTime.now().minusDays(5);
        equipamento.setCriadoEm(dataAntiga);

        when(equipamentoRepository.save(any(Equipamento.class))).thenAnswer(inv -> inv.getArgument(0));

        Equipamento salvo = equipamentoService.salvar(equipamento);

        assertNotNull(salvo);
        assertEquals(dataAntiga, salvo.getCriadoEm(), "A data de criação não deveria ser sobrescrita.");
        verify(equipamentoRepository, times(1)).save(equipamento);
    }


    @Test
    void deveDeletarEquipamentoPorId() {
        doNothing().when(equipamentoRepository).deleteById(1);

        equipamentoService.deletar(1);

        verify(equipamentoRepository, times(1)).deleteById(1);
    }

}