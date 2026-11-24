package com.grupo5.ta_share.dto.response;

public record LoginResponseDTO(
        Integer id,
        String nome,
        String email,
        String perfil
) {}