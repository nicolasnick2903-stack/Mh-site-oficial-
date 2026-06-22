package com.mhfacilities.controller;

import java.time.LocalDateTime;

import com.mhfacilities.entity.Chamado;

public record ChamadoResponse(
    Long id,
    String numero,
    String condominio,
    String sindicoNome,
    String sindicoEmail,
    String categoria,
    String prioridade,
    String assunto,
    String descricao,
    String status,
    LocalDateTime createdAt
) {

    public static ChamadoResponse from(Chamado chamado) {
        return new ChamadoResponse(
            chamado.getId(),
            chamado.getNumero(),
            chamado.getCondominio().getNome(),
            chamado.getSindicoNome(),
            chamado.getSindicoEmail(),
            chamado.getCategoria().name(),
            chamado.getPrioridade().name(),
            chamado.getAssunto(),
            chamado.getDescricao(),
            chamado.getStatus().name(),
            chamado.getCreatedAt()
        );
    }
}
