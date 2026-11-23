package com.grupo5.ta_share.service;

import com.grupo5.ta_share.dto.request.EquipamentoRequestDTO;
import com.grupo5.ta_share.dto.response.EquipamentoResponseDTO;
import com.grupo5.ta_share.model.Categoria;
import com.grupo5.ta_share.model.Equipamento;
import com.grupo5.ta_share.repository.CategoriaRepository;
import com.grupo5.ta_share.repository.EquipamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EquipamentoService {

    @Autowired
    private EquipamentoRepository equipamentoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    public List<EquipamentoResponseDTO> listarTodos() {
        return equipamentoRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public Optional<EquipamentoResponseDTO> buscarPorId(Integer id) {
        return equipamentoRepository.findById(id)
                .map(this::toResponseDTO);
    }

    public EquipamentoResponseDTO criar(EquipamentoRequestDTO dto) {
        Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada!"));

        Equipamento equipamento = new Equipamento();
        equipamento.setNome(dto.nome());
        equipamento.setPatrimonio(dto.patrimonio());
        equipamento.setCategoria(categoria);
        equipamento.setEstadoConservacao(dto.estadoConservacao());
        equipamento.setStatusItem(dto.statusItem());
        equipamento.setDescricao(dto.descricao());
        equipamento.setCriadoEm(LocalDateTime.now());

        return toResponseDTO(equipamentoRepository.save(equipamento));
    }

    public Optional<EquipamentoResponseDTO> atualizar(Integer id, EquipamentoRequestDTO dto) {
        return equipamentoRepository.findById(id).map(existente -> {
            Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada!"));

            existente.setNome(dto.nome());
            existente.setPatrimonio(dto.patrimonio());
            existente.setCategoria(categoria);
            existente.setEstadoConservacao(dto.estadoConservacao());
            existente.setStatusItem(dto.statusItem());
            existente.setDescricao(dto.descricao());

            return toResponseDTO(equipamentoRepository.save(existente));
        });
    }

    public boolean deletar(Integer id) {
        if (!equipamentoRepository.existsById(id)) {
            return false;
        }
        equipamentoRepository.deleteById(id);
        return true;
    }

    public EquipamentoResponseDTO toResponseDTO(Equipamento equipamento) {
        return new EquipamentoResponseDTO(
                equipamento.getId(),
                equipamento.getNome(),
                equipamento.getPatrimonio(),
                equipamento.getCategoria() != null ? equipamento.getCategoria().getId() : null,
                equipamento.getCategoria() != null ? equipamento.getCategoria().getNome() : null,
                equipamento.getEstadoConservacao(),
                equipamento.getStatusItem(),
                equipamento.getDescricao(),
                equipamento.getCriadoEm()
        );
    }
}