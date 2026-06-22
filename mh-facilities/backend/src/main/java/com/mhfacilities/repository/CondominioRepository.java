package com.mhfacilities.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mhfacilities.entity.Condominio;

public interface CondominioRepository extends JpaRepository<Condominio, Long> {

    Optional<Condominio> findByNomeIgnoreCase(String nome);
}
