package com.grupo5.ta_share.service;

import com.grupo5.ta_share.model.Usuario;
import com.grupo5.ta_share.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorId(Integer id) {
        return usuarioRepository.findById(id);
    }

    public Usuario salvar(Usuario usuario) {
        if (usuario.getId() == null && usuario.getCriadoEms() == null) {
            usuario.setCriadoEms(LocalDateTime.now());
        }
        return usuarioRepository.save(usuario);
    }

    public void deletar(Integer id) {
        usuarioRepository.deleteById(id);
    }
}