package com.mhfacilities.controller;

public class CriarOrcamentoRequest {

    private String nome;
    private String empresaCondominio;
    private String telefone;
    private String email;
    private String servico;
    private String mensagem;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmpresaCondominio() {
        return empresaCondominio;
    }

    public void setEmpresaCondominio(String empresaCondominio) {
        this.empresaCondominio = empresaCondominio;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getServico() {
        return servico;
    }

    public void setServico(String servico) {
        this.servico = servico;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }
}
