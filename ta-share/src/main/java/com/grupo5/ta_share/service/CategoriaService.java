package com.grupo5.ta_share.service;

import com.grupo5.ta_share.dto.request.CategoriaRequestDTO;
import com.grupo5.ta_share.dto.response.CategoriaResponseDTO;
import com.grupo5.ta_share.model.Categoria;
import com.grupo5.ta_share.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    public List<CategoriaResponseDTO> listarTodas() {
        return categoriaRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public Optional<CategoriaResponseDTO> buscarPorId(Integer id) {
        return categoriaRepository.findById(id)
                .map(this::toResponseDTO);
    }

    public CategoriaResponseDTO criar(CategoriaRequestDTO dto) {
        Categoria categoria = new Categoria();
        categoria.setNome(dto.nome());
        categoria.setDescricao(dto.descricao());

        return toResponseDTO(categoriaRepository.save(categoria));
    }

    public Optional<CategoriaResponseDTO> atualizar(Integer id, CategoriaRequestDTO dto) {
        return categoriaRepository.findById(id).map(existente -> {
            existente.setNome(dto.nome());
            existente.setDescricao(dto.descricao());

            return toResponseDTO(categoriaRepository.save(existente));
        });
    }

    public boolean deletar(Integer id) {
        if (!categoriaRepository.existsById(id)) {
            return false;
        }
        categoriaRepository.deleteById(id);
        return true;
    }

    public CategoriaResponseDTO toResponseDTO(Categoria categoria) {
        return new CategoriaResponseDTO(
                categoria.getId(),
                categoria.getNome(),
                categoria.getDescricao()
        );
    }
}