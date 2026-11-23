package com.grupo5.ta_share.service;

import com.grupo5.ta_share.dto.request.UsuarioRequestDTO;
import com.grupo5.ta_share.dto.response.UsuarioResponseDTO;
import com.grupo5.ta_share.model.Usuario;
import com.grupo5.ta_share.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public Optional<UsuarioResponseDTO> buscarPorId(Integer id) {
        return usuarioRepository.findById(id)
                .map(this::toResponseDTO);
    }

    public UsuarioResponseDTO criar(UsuarioRequestDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setSenha(passwordEncoder.encode(dto.senha()));
        usuario.setCpf(dto.cpf());
        usuario.setTelefone(dto.telefone());
        usuario.setPerfil(dto.perfil());
        usuario.setCriadoEms(LocalDateTime.now());

        return toResponseDTO(usuarioRepository.save(usuario));
    }

    public Optional<UsuarioResponseDTO> atualizar(Integer id, UsuarioRequestDTO dto) {
        return usuarioRepository.findById(id).map(existente -> {
            existente.setNome(dto.nome());
            existente.setEmail(dto.email());
            if (dto.senha() != null && !dto.senha().isBlank() && !dto.senha().startsWith("$2a$")) {
                existente.setSenha(passwordEncoder.encode(dto.senha()));
            }
            existente.setCpf(dto.cpf());
            existente.setTelefone(dto.telefone());
            existente.setPerfil(dto.perfil());

            return toResponseDTO(usuarioRepository.save(existente));
        });
    }

    public boolean deletar(Integer id) {
        if (!usuarioRepository.existsById(id)) {
            return false;
        }
        usuarioRepository.deleteById(id);
        return true;
    }

    public Usuario buscarEntidadePorId(Integer id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado!"));
    }

    public UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getPerfil(),
                usuario.getCriadoEms()
        );
    }
}