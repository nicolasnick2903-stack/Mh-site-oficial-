package com.mhfacilities.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.env.Environment;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mhfacilities.controller.CriarOrcamentoRequest;
import com.mhfacilities.entity.Orcamento;
import com.mhfacilities.repository.OrcamentoRepository;

@Service
public class OrcamentoService {

    private final OrcamentoRepository orcamentoRepository;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final Environment environment;

    public OrcamentoService(
        OrcamentoRepository orcamentoRepository,
        ObjectProvider<JavaMailSender> mailSenderProvider,
        Environment environment
    ) {
        this.orcamentoRepository = orcamentoRepository;
        this.mailSenderProvider = mailSenderProvider;
        this.environment = environment;
    }

    @Transactional
    public Orcamento criar(CriarOrcamentoRequest request) {
        validar(request.getNome(), "Nome");
        validar(request.getEmpresaCondominio(), "Empresa ou condominio");
        validar(request.getTelefone(), "Telefone");
        validar(request.getEmail(), "Email");
        validar(request.getServico(), "Servico");

        Orcamento orcamento = new Orcamento();
        orcamento.setNome(request.getNome().trim());
        orcamento.setEmpresaCondominio(request.getEmpresaCondominio().trim());
        orcamento.setTelefone(request.getTelefone().trim());
        orcamento.setEmail(request.getEmail().trim());
        orcamento.setServico(request.getServico().trim());
        orcamento.setMensagem(trim(request.getMensagem()));

        orcamento = orcamentoRepository.save(orcamento);
        enviarEmail(orcamento);
        return orcamento;
    }

    private void enviarEmail(Orcamento orcamento) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();

        if (mailSender == null || isBlank(environment.getProperty("spring.mail.host"))) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("mhfacilitiesseguranca@gmail.com");
        message.setSubject("[NOVO ORCAMENTO] " + orcamento.getEmpresaCondominio());
        message.setText("""
            Nome:
            %s

            Empresa ou condominio:
            %s

            Telefone:
            %s

            Email:
            %s

            Servico desejado:
            %s

            Mensagem:
            %s
            """.formatted(
                orcamento.getNome(),
                orcamento.getEmpresaCondominio(),
                orcamento.getTelefone(),
                orcamento.getEmail(),
                orcamento.getServico(),
                orcamento.getMensagem() == null ? "" : orcamento.getMensagem()
            ));
        mailSender.send(message);
    }

    private void validar(String value, String campo) {
        if (isBlank(value)) {
            throw new IllegalArgumentException(campo + " e obrigatorio");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
