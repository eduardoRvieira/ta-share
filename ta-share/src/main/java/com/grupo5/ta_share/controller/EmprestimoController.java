package com.grupo5.ta_share.controller;

import com.grupo5.ta_share.model.Emprestimo;
import com.grupo5.ta_share.service.EmprestimoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    @Autowired
    private EmprestimoService emprestimoService;

    // GET: http://localhost:8080/api/emprestimos
    @GetMapping
    public List<Emprestimo> listar() {
        return emprestimoService.listarTodos();
    }

    // POST: http://localhost:8080/api/emprestimos
    @PostMapping
    public Emprestimo criar(@RequestBody Emprestimo emprestimo) {
        return emprestimoService.salvar(emprestimo);
    }

    // GET por ID: http://localhost:8080/api/emprestimos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Emprestimo> buscarPorId(@PathVariable Integer id) {
        return emprestimoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE: http://localhost:8080/api/emprestimos/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        if (emprestimoService.buscarPorId(id).isPresent()) {
            emprestimoService.deletar(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}