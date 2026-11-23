package com.grupo5.ta_share.dto.response;

import java.time.LocalDateTime;

public record UsuarioResponseDTO(
        Integer id,
        String nome,
        String email,
        String telefone,
        String perfil,
        LocalDateTime criadoEms
) {}