package com.grupo5.ta_share.service;

import com.grupo5.ta_share.model.Emprestimo;
import com.grupo5.ta_share.model.Equipamento;
import com.grupo5.ta_share.repository.EmprestimoRepository;
import com.grupo5.ta_share.repository.EquipamentoRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

    @Transactional
    public Emprestimo salvar(Emprestimo emprestimo) {
        // 1. Preenche a data de empréstimo automaticamente no cadastro
        if (emprestimo.getId() == null) {
            if (emprestimo.getDataEmprestimo() == null) {
                emprestimo.setDataEmprestimo(LocalDate.now());
            }
        } else if (emprestimo.getDataEmprestimo() == null) {
            emprestimoRepository.findById(emprestimo.getId())
                    .ifPresent(existente -> emprestimo.setDataEmprestimo(existente.getDataEmprestimo()));
        }

        // 2. Validação de disponibilidade e atualização do equipamento
        if (emprestimo.getEquipamento() != null && emprestimo.getEquipamento().getId() != null) {
            Equipamento equipamento = equipamentoRepository.findById(emprestimo.getEquipamento().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipamento não encontrado!"));

            // NOVO EMPRÉSTIMO (POST)
            if (emprestimo.getId() == null) {
                if ("EMPRESTADO".equalsIgnoreCase(equipamento.getStatusItem())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Este equipamento já está emprestado no momento!");
                } else if ("MANUTENCAO".equalsIgnoreCase(equipamento.getStatusItem())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Este equipamento está em manutenção e não pode ser emprestado!");
            }

                if ("DISPONIVEL".equalsIgnoreCase(equipamento.getStatusItem())) {
                    equipamento.setStatusItem("EMPRESTADO");
                    equipamentoRepository.save(equipamento);
                } else {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Este equipamento não está disponível. Status atual: " + equipamento.getStatusItem());
                }
            }
            // ATUALIZAÇÃO / DEVOLUÇÃO (PUT)
            else if ("DEVOLVIDO".equalsIgnoreCase(emprestimo.getStatus())) {
                equipamento.setStatusItem("DISPONIVEL");
                equipamentoRepository.save(equipamento);

                if (emprestimo.getDataDevolucaoReal() == null) {
                    emprestimo.setDataDevolucaoReal(LocalDate.now());
                }
            }
        }

        return emprestimoRepository.save(emprestimo);
    }

    public void deletar(Integer id) {
        emprestimoRepository.deleteById(id);
    }
}