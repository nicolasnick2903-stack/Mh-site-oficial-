package com.mhfacilities.controller;

import java.time.LocalDateTime;

import com.mhfacilities.entity.Notificacao;

public record NotificacaoResponse(
    Long id,
    Long condominioId,
    Long chamadoId,
    String chamadoNumero,
    String tipo,
    String destinatario,
    String statusEnvio,
    LocalDateTime createdAt
) {

    public static NotificacaoResponse from(Notificacao notificacao) {
        return new NotificacaoResponse(
            notificacao.getId(),
            notificacao.getCondominio() == null ? null : notificacao.getCondominio().getId(),
            notificacao.getChamado() == null ? null : notificacao.getChamado().getId(),
            notificacao.getChamado() == null ? null : notificacao.getChamado().getNumero(),
            notificacao.getTipo().name(),
            notificacao.getDestinatario(),
            notificacao.getStatusEnvio().name(),
            notificacao.getCreatedAt()
        );
    }
}
