package com.grupo5.ta_share.service;

import com.grupo5.ta_share.model.Equipamento;
import com.grupo5.ta_share.repository.EquipamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EquipamentoService {

    @Autowired
    private EquipamentoRepository equipamentoRepository;

    public List<Equipamento> listarTodos() {
        return equipamentoRepository.findAll();
    }

    public Optional<Equipamento> buscarPorId(Integer id) {
        return equipamentoRepository.findById(id);
    }

    public Equipamento salvar(Equipamento equipamento) {
        if (equipamento.getId() == null && equipamento.getCriadoEm() == null) {
            equipamento.setCriadoEm(LocalDateTime.now());
        }
        return equipamentoRepository.save(equipamento);
    }

    public void deletar(Integer id) {
        equipamentoRepository.deleteById(id);
    }
}