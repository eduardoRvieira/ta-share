package com.grupo5.ta_share.repository;

import com.grupo5.ta_share.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    // Método de busca por e-mail usado pelo Spring Security (UserDetailsServiceImpl)
    Optional<Usuario> findByEmail(String email);

}