package com.grupo5.ta_share.controller;

import com.grupo5.ta_share.model.Equipamento;
import com.grupo5.ta_share.service.EquipamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipamentos")
public class EquipamentoController {

    @Autowired
    private EquipamentoService equipamentoService;

    // GET: http://localhost:8080/api/equipamentos
    @GetMapping
    public List<Equipamento> listar() {
        return equipamentoService.listarTodos();
    }

    // POST: http://localhost:8080/api/equipamentos
    @PostMapping
    public Equipamento criar(@RequestBody Equipamento equipamento) {
        return equipamentoService.salvar(equipamento);
    }

    // GET por ID: http://localhost:8080/api/equipamentos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Equipamento> buscarPorId(@PathVariable Integer id) {
        return equipamentoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE: http://localhost:8080/api/equipamentos/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        if (equipamentoService.buscarPorId(id).isPresent()) {
            equipamentoService.deletar(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}