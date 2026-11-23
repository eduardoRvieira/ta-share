package com.grupo5.ta_share.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CategoriaRequestDTO(
        @NotBlank(message = "O nome é obrigatório")
        String nome,
        String descricao
) {}