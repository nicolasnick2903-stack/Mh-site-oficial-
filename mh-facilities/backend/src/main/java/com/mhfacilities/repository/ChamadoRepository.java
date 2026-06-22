package com.mhfacilities.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mhfacilities.entity.Chamado;

public interface ChamadoRepository extends JpaRepository<Chamado, Long> {

    List<Chamado> findAllByOrderByCreatedAtDesc();
}
