package com.grupo5.ta_share.service;

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

    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    public Optional<Categoria> buscarPorId(Integer id) {
        return categoriaRepository.findById(id);
    }

    // Salvar ou atualizar categoria
    public Categoria salvar(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    // Deletar categoria
    public void deletar(Integer id) {
        categoriaRepository.deleteById(id);
    }
}