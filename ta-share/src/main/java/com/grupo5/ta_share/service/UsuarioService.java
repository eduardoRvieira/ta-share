    package com.grupo5.ta_share.service;

    import com.grupo5.ta_share.model.Usuario;
    import com.grupo5.ta_share.repository.UsuarioRepository;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.security.crypto.password.PasswordEncoder;
    import org.springframework.stereotype.Service;

    import java.time.LocalDateTime;
    import java.util.List;
    import java.util.Optional;

    @Service
    public class UsuarioService {

        @Autowired
        private UsuarioRepository usuarioRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        public List<Usuario> listarTodos() {
            return usuarioRepository.findAll();
        }

        public Optional<Usuario> buscarPorId(Integer id) {
            return usuarioRepository.findById(id);
        }

        public Usuario salvar(Usuario usuario) {
            // Criptografa a senha apenas se ela foi preenchida/alterada
            if (usuario.getSenha() != null && !usuario.getSenha().startsWith("$2a$")) {
                usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
            }

            if (usuario.getId() == null && usuario.getCriadoEms() == null) {
                usuario.setCriadoEms(LocalDateTime.now());
            }

            return usuarioRepository.save(usuario);
        }

        public void deletar(Integer id) {
            usuarioRepository.deleteById(id);
        }
    }