package com.grupo5.ta_share.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EquipamentoRequestDTO(
        @NotBlank(message = "O nome é obrigatório")
        String nome,

        @NotBlank(message = "O patrimônio é obrigatório")
        String patrimonio,

        @NotNull(message = "A categoria é obrigatória")
        Integer categoriaId,

        @NotBlank(message = "O estado de conservação é obrigatório")
        String estadoConservacao,

        @NotBlank(message = "Obrigatório o status do item")
        String statusItem,

        String descricao
) {}