package com.grupo5.ta_share.service;

import com.grupo5.ta_share.model.Emprestimo;
import com.grupo5.ta_share.model.Equipamento;
import com.grupo5.ta_share.repository.EmprestimoRepository;
import com.grupo5.ta_share.repository.EquipamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class EmprestimoService {

    @Autowired
    private EmprestimoRepository emprestimoRepository;

    @Autowired
    private EquipamentoRepository equipamentoRepository;

    public List<Emprestimo> listarTodos() {
        return emprestimoRepository.findAll();
    }

    public Optional<Emprestimo> buscarPorId(Integer id) {
        return emprestimoRepository.findById(id);
    }

    public Emprestimo salvar(Emprestimo emprestimo) {
        if (emprestimo.getId() == null && emprestimo.getDataEmprestimo() == null) {
            emprestimo.setDataEmprestimo(LocalDate.now());
        }

        if ("ATIVO".equalsIgnoreCase(emprestimo.getStatus()) && emprestimo.getEquipamento() != null) {
            Optional<Equipamento> equipOpt = equipamentoRepository.findById(emprestimo.getEquipamento().getId());
            if (equipOpt.isPresent()) {
                Equipamento equipamento = equipOpt.get();
                equipamento.setStatusItem("EMPRESTADO");
                equipamentoRepository.save(equipamento);
            }
        }

        return emprestimoRepository.save(emprestimo);
    }

    public void deletar(Integer id) {
        emprestimoRepository.deleteById(id);
    }
}