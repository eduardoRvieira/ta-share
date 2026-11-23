package com.grupo5.ta_share.dto.response;

import java.time.LocalDate;

public record EmprestimoResponseDTO(
        Integer id,
        Integer usuarioId,
        String usuarioNome,
        Integer equipamentoId,
        String equipamentoNome,
        LocalDate dataEmprestimo,
        LocalDate dataDevolucaoPrevista,
        LocalDate dataDevolucaoReal,
        String status,
        String observacoes
) {}