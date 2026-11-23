package com.grupo5.ta_share.dto.response;

import java.time.LocalDateTime;

public record EquipamentoResponseDTO(
        Integer id,
        String nome,
        String patrimonio,
        Integer categoriaId,
        String categoriaNome,
        String estadoConservacao,
        String statusItem,
        String descricao,
        LocalDateTime criadoEm
) {}