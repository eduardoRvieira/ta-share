package com.grupo5.ta_share.controller;

import com.grupo5.ta_share.dto.request.EmprestimoRequestDTO;
import com.grupo5.ta_share.dto.response.EmprestimoResponseDTO;
import com.grupo5.ta_share.service.EmprestimoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    @Autowired
    private EmprestimoService emprestimoService;

    @GetMapping
    public List<EmprestimoResponseDTO> listar() {
        return emprestimoService.listarTodos();
    }

    @PostMapping
    public ResponseEntity<EmprestimoResponseDTO> criar(@RequestBody @Valid EmprestimoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(emprestimoService.criar(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmprestimoResponseDTO> buscarPorId(@PathVariable Integer id) {
        return emprestimoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        if (emprestimoService.deletar(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmprestimoResponseDTO> atualizar(@PathVariable Integer id, @RequestBody @Valid EmprestimoRequestDTO dto) {
        return emprestimoService.atualizar(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}