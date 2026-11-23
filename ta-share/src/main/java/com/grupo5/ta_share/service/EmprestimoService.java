package com.grupo5.ta_share.service;

import com.grupo5.ta_share.dto.request.EmprestimoRequestDTO;
import com.grupo5.ta_share.dto.response.EmprestimoResponseDTO;
import com.grupo5.ta_share.model.Emprestimo;
import com.grupo5.ta_share.model.Equipamento;
import com.grupo5.ta_share.model.Usuario;
import com.grupo5.ta_share.repository.EmprestimoRepository;
import com.grupo5.ta_share.repository.EquipamentoRepository;
import com.grupo5.ta_share.repository.UsuarioRepository;
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

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<EmprestimoResponseDTO> listarTodos() {
        return emprestimoRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public Optional<EmprestimoResponseDTO> buscarPorId(Integer id) {
        return emprestimoRepository.findById(id)
                .map(this::toResponseDTO);
    }

    @Transactional
    public EmprestimoResponseDTO criar(EmprestimoRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.usuarioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado!"));

        Equipamento equipamento = equipamentoRepository.findById(dto.equipamentoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipamento não encontrado!"));

        if ("EMPRESTADO".equalsIgnoreCase(equipamento.getStatusItem())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Este equipamento já está emprestado no momento!");
        } else if ("MANUTENCAO".equalsIgnoreCase(equipamento.getStatusItem())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Este equipamento está em manutenção e não pode ser emprestado!");
        } else if (!"DISPONIVEL".equalsIgnoreCase(equipamento.getStatusItem())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Este equipamento não está disponível. Status atual: " + equipamento.getStatusItem());
        }

        equipamento.setStatusItem("EMPRESTADO");
        equipamentoRepository.save(equipamento);

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setUsuario(usuario);
        emprestimo.setEquipamento(equipamento);
        emprestimo.setDataEmprestimo(dto.dataEmprestimo() != null ? dto.dataEmprestimo() : LocalDate.now());
        emprestimo.setDataDevolucaoPrevista(dto.dataDevolucaoPrevista());
        emprestimo.setDataDevolucaoReal(dto.dataDevolucaoReal());
        emprestimo.setStatus(dto.status());
        emprestimo.setObservacoes(dto.observacoes());

        return toResponseDTO(emprestimoRepository.save(emprestimo));
    }

    @Transactional
    public Optional<EmprestimoResponseDTO> atualizar(Integer id, EmprestimoRequestDTO dto) {
        return emprestimoRepository.findById(id).map(existente -> {
            Usuario usuario = usuarioRepository.findById(dto.usuarioId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado!"));

            Equipamento equipamento = equipamentoRepository.findById(dto.equipamentoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipamento não encontrado!"));

            existente.setUsuario(usuario);
            existente.setEquipamento(equipamento);
            existente.setDataEmprestimo(dto.dataEmprestimo() != null ? dto.dataEmprestimo() : existente.getDataEmprestimo());
            existente.setDataDevolucaoPrevista(dto.dataDevolucaoPrevista());
            existente.setStatus(dto.status());
            existente.setObservacoes(dto.observacoes());

            if ("DEVOLVIDO".equalsIgnoreCase(dto.status())) {
                equipamento.setStatusItem("DISPONIVEL");
                equipamentoRepository.save(equipamento);
                existente.setDataDevolucaoReal(dto.dataDevolucaoReal() != null ? dto.dataDevolucaoReal() : LocalDate.now());
            } else {
                existente.setDataDevolucaoReal(dto.dataDevolucaoReal());
            }

            return toResponseDTO(emprestimoRepository.save(existente));
        });
    }

    public boolean deletar(Integer id) {
        if (!emprestimoRepository.existsById(id)) {
            return false;
        }
        emprestimoRepository.deleteById(id);
        return true;
    }

    public EmprestimoResponseDTO toResponseDTO(Emprestimo emprestimo) {
        return new EmprestimoResponseDTO(
                emprestimo.getId(),
                emprestimo.getUsuario() != null ? emprestimo.getUsuario().getId() : null,
                emprestimo.getUsuario() != null ? emprestimo.getUsuario().getNome() : null,
                emprestimo.getEquipamento() != null ? emprestimo.getEquipamento().getId() : null,
                emprestimo.getEquipamento() != null ? emprestimo.getEquipamento().getNome() : null,
                emprestimo.getDataEmprestimo(),
                emprestimo.getDataDevolucaoPrevista(),
                emprestimo.getDataDevolucaoReal(),
                emprestimo.getStatus(),
                emprestimo.getObservacoes()
        );
    }
}