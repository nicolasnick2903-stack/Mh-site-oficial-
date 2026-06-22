package com.mhfacilities.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mhfacilities.entity.Notificacao;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    List<Notificacao> findAllByOrderByCreatedAtDesc();
}
