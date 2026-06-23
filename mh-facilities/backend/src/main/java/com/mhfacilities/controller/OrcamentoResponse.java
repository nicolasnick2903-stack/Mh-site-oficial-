package com.mhfacilities.controller;

import java.time.LocalDateTime;

import com.mhfacilities.entity.Orcamento;

public record OrcamentoResponse(
    Long id,
    String nome,
    String empresaCondominio,
    String telefone,
    String email,
    String servico,
    String mensagem,
    LocalDateTime createdAt
) {

    public static OrcamentoResponse from(Orcamento orcamento) {
        return new OrcamentoResponse(
            orcamento.getId(),
            orcamento.getNome(),
            orcamento.getEmpresaCondominio(),
            orcamento.getTelefone(),
            orcamento.getEmail(),
            orcamento.getServico(),
            orcamento.getMensagem(),
            orcamento.getCreatedAt()
        );
    }
}
