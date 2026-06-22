package com.mhfacilities.controller;

public class CriarChamadoRequest {

    private String sindicoNome;
    private String sindicoCpf;
    private String sindicoEmail;
    private String sindicoTelefone;
    private String condominioNome;
    private String categoria;
    private String prioridade;
    private String assunto;
    private String descricao;

    public String getSindicoNome() {
        return sindicoNome;
    }

    public void setSindicoNome(String sindicoNome) {
        this.sindicoNome = sindicoNome;
    }

    public String getSindicoCpf() {
        return sindicoCpf;
    }

    public void setSindicoCpf(String sindicoCpf) {
        this.sindicoCpf = sindicoCpf;
    }

    public String getSindicoEmail() {
        return sindicoEmail;
    }

    public void setSindicoEmail(String sindicoEmail) {
        this.sindicoEmail = sindicoEmail;
    }

    public String getSindicoTelefone() {
        return sindicoTelefone;
    }

    public void setSindicoTelefone(String sindicoTelefone) {
        this.sindicoTelefone = sindicoTelefone;
    }

    public String getCondominioNome() {
        return condominioNome;
    }

    public void setCondominioNome(String condominioNome) {
        this.condominioNome = condominioNome;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(String prioridade) {
        this.prioridade = prioridade;
    }

    public String getAssunto() {
        return assunto;
    }

    public void setAssunto(String assunto) {
        this.assunto = assunto;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
}
