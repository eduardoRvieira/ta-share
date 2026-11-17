package com.grupo5.ta_share.controller;

import com.grupo5.ta_share.model.Categoria;
import com.grupo5.ta_share.service.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;

    // GET: http://localhost:8080/api/categorias
    @GetMapping
    public List<Categoria> listar() {
        return categoriaService.listarTodas();
    }

    // POST: http://localhost:8080/api/categorias
    @PostMapping
    public Categoria criar(@RequestBody @Valid Categoria categoria) {
        return categoriaService.salvar(categoria);
    }

    // GET por ID: http://localhost:8080/api/categorias/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Categoria> buscarPorId(@PathVariable Integer id) {
        return categoriaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE: http://localhost:8080/api/categorias/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        if (categoriaService.buscarPorId(id).isPresent()) {
            categoriaService.deletar(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // PUT: http://localhost:8080/api/categorias/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Categoria> atualizar(@PathVariable Integer id, @RequestBody Categoria categoria) {
        if (!categoriaService.buscarPorId(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        categoria.setId(id); // Garante que vai atualizar o registro correto
        Categoria categoriaAtualizada = categoriaService.salvar(categoria);
        return ResponseEntity.ok(categoriaAtualizada);
    }
}