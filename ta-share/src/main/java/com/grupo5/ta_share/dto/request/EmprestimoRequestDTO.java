package com.grupo5.ta_share.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record EmprestimoRequestDTO(
        @NotNull(message = "O usuario é obrigatório")
        Integer usuarioId,

        @NotNull(message = "O equipamento é obrigatório")
        Integer equipamentoId,

        LocalDate dataEmprestimo,

        @NotNull(message = "Data obrigatória")
        LocalDate dataDevolucaoPrevista,

        LocalDate dataDevolucaoReal,

        @NotBlank(message = "O status é obrigatório")
        String status,

        String observacoes
) {}