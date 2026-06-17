package com.mhfacilities.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mhfacilities.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

}
