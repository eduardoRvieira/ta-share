package com.grupo5.ta_share.controller;

import com.grupo5.ta_share.dto.request.EquipamentoRequestDTO;
import com.grupo5.ta_share.dto.response.EquipamentoResponseDTO;
import com.grupo5.ta_share.service.EquipamentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipamentos")
public class EquipamentoController {

    @Autowired
    private EquipamentoService equipamentoService;

    @GetMapping
    public List<EquipamentoResponseDTO> listar() {
        return equipamentoService.listarTodos();
    }

    @PostMapping
    public ResponseEntity<EquipamentoResponseDTO> criar(@RequestBody @Valid EquipamentoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipamentoService.criar(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipamentoResponseDTO> buscarPorId(@PathVariable Integer id) {
        return equipamentoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        if (equipamentoService.deletar(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipamentoResponseDTO> atualizar(@PathVariable Integer id, @RequestBody @Valid EquipamentoRequestDTO dto) {
        return equipamentoService.atualizar(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}