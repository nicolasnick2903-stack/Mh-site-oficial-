package com.mhfacilities.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mhfacilities.entity.Orcamento;

public interface OrcamentoRepository extends JpaRepository<Orcamento, Long> {

    List<Orcamento> findAllByOrderByCreatedAtDesc();
}
