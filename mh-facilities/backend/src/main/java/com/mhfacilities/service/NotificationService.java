package com.mhfacilities.service;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashSet;
import java.util.Set;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import com.mhfacilities.entity.Chamado;
import com.mhfacilities.entity.Notificacao;
import com.mhfacilities.entity.StatusChamado;
import com.mhfacilities.entity.StatusEnvio;
import com.mhfacilities.entity.TipoNotificacao;
import com.mhfacilities.repository.NotificacaoRepository;

@Service
public class NotificationService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final NotificationProperties properties;
    private final NotificacaoRepository notificacaoRepository;
    private final RestClient restClient;
    private final Environment environment;

    public NotificationService(
        ObjectProvider<JavaMailSender> mailSenderProvider,
        NotificationProperties properties,
        NotificacaoRepository notificacaoRepository,
        RestClient.Builder restClientBuilder,
        Environment environment
    ) {
        this.mailSenderProvider = mailSenderProvider;
        this.properties = properties;
        this.notificacaoRepository = notificacaoRepository;
        this.restClient = restClientBuilder.build();
        this.environment = environment;
    }

    public void notificarNovoChamado(Chamado chamado) {
        String assunto = "[NOVO CHAMADO] " + chamado.getCondominio().getNome();
        String corpo = """
            Condominio:
            %s

            Categoria:
            %s

            Prioridade:
            %s

            Assunto:
            %s

            Descricao:
            %s

            Data:
            %s

            Numero do chamado:
            %s
            """.formatted(
                chamado.getCondominio().getNome(),
                chamado.getCategoria(),
                chamado.getPrioridade(),
                chamado.getAssunto(),
                chamado.getDescricao(),
                chamado.getCreatedAt().format(DATE_FORMAT),
                chamado.getNumero()
            );

        Set<String> destinatarios = new LinkedHashSet<>(properties.getAdminEmails());
        destinatarios.add("mhfacilitiesseguranca@gmail.com");
        destinatarios.forEach(email -> enviarEmail(chamado, email, assunto, corpo));

        String whatsapp = """
            NOVO CHAMADO RECEBIDO

            Condominio:
            %s

            Categoria:
            %s

            Prioridade:
            %s

            Assunto:
            %s

            Chamado:
            %s

            Acesse o painel administrativo para visualizar.
            """.formatted(
                chamado.getCondominio().getNome(),
                chamado.getCategoria(),
                chamado.getPrioridade(),
                chamado.getAssunto(),
                chamado.getNumero()
            );

        enviarWhatsapp(chamado, properties.getAdminWhatsappNumber(), whatsapp);

        String confirmacaoSindico = """
            Ola.

            Recebemos seu chamado %s.

            Status:
            ABERTO

            Equipe MH Facilities & Seguranca.
            """.formatted(chamado.getNumero());

        enviarEmail(chamado, chamado.getSindicoEmail(), "Confirmacao do chamado " + chamado.getNumero(), confirmacaoSindico);
        enviarWhatsapp(chamado, chamado.getSindicoTelefone(), confirmacaoSindico);
    }

    public void notificarAtualizacaoStatus(Chamado chamado, StatusChamado status) {
        String mensagem = """
            Ola.

            Seu chamado %s foi atualizado.

            Novo status:
            %s

            Equipe MH Facilities & Seguranca.
            """.formatted(chamado.getNumero(), status);

        enviarEmail(chamado, chamado.getSindicoEmail(), "Atualizacao do chamado " + chamado.getNumero(), mensagem);
        enviarWhatsapp(chamado, chamado.getSindicoTelefone(), mensagem);
    }

    private void enviarEmail(Chamado chamado, String destinatario, String assunto, String corpo) {
        if (destinatario == null || destinatario.isBlank()) {
            return;
        }

        StatusEnvio status = StatusEnvio.PENDENTE;
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();

        if (mailSender != null && !isBlank(environment.getProperty("spring.mail.host"))) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(destinatario);
                message.setSubject(assunto);
                message.setText(corpo);
                mailSender.send(message);
                status = StatusEnvio.ENVIADO;
            } catch (RuntimeException ex) {
                status = StatusEnvio.ERRO;
            }
        }

        registrar(chamado, TipoNotificacao.EMAIL, destinatario, status);
    }

    private void enviarWhatsapp(Chamado chamado, String destinatario, String mensagem) {
        if (destinatario == null || destinatario.isBlank()) {
            return;
        }

        StatusEnvio status = StatusEnvio.PENDENTE;

        try {
            if ("twilio".equalsIgnoreCase(properties.getWhatsappProvider())) {
                status = enviarTwilio(destinatario, mensagem);
            } else {
                status = enviarMeta(destinatario, mensagem);
            }
        } catch (RuntimeException ex) {
            status = StatusEnvio.ERRO;
        }

        registrar(chamado, TipoNotificacao.WHATSAPP, destinatario, status);
    }

    private StatusEnvio enviarMeta(String destinatario, String mensagem) {
        if (isBlank(properties.getWhatsappToken()) || isBlank(properties.getWhatsappPhoneNumberId())) {
            return StatusEnvio.PENDENTE;
        }

        restClient.post()
            .uri("https://graph.facebook.com/v20.0/{phoneNumberId}/messages", properties.getWhatsappPhoneNumberId())
            .header("Authorization", "Bearer " + properties.getWhatsappToken())
            .contentType(MediaType.APPLICATION_JSON)
            .body("""
                {
                  "messaging_product": "whatsapp",
                  "to": "%s",
                  "type": "text",
                  "text": { "body": "%s" }
                }
                """.formatted(somenteNumeros(destinatario), escapeJson(mensagem)))
            .retrieve()
            .toBodilessEntity();

        return StatusEnvio.ENVIADO;
    }

    private StatusEnvio enviarTwilio(String destinatario, String mensagem) {
        if (isBlank(properties.getTwilioAccountSid()) || isBlank(properties.getTwilioAuthToken()) || isBlank(properties.getTwilioFromNumber())) {
            return StatusEnvio.PENDENTE;
        }

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("From", "whatsapp:" + properties.getTwilioFromNumber());
        body.add("To", "whatsapp:" + destinatario);
        body.add("Body", mensagem);

        restClient.post()
            .uri("https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json", properties.getTwilioAccountSid())
            .headers(headers -> headers.setBasicAuth(properties.getTwilioAccountSid(), properties.getTwilioAuthToken(), StandardCharsets.UTF_8))
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(body)
            .retrieve()
            .toBodilessEntity();

        return StatusEnvio.ENVIADO;
    }

    private void registrar(Chamado chamado, TipoNotificacao tipo, String destinatario, StatusEnvio status) {
        Notificacao notificacao = new Notificacao();
        notificacao.setCondominio(chamado.getCondominio());
        notificacao.setChamado(chamado);
        notificacao.setTipo(tipo);
        notificacao.setDestinatario(destinatario);
        notificacao.setStatusEnvio(status);
        notificacaoRepository.save(notificacao);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String somenteNumeros(String value) {
        return value.replaceAll("\\D", "");
    }

    private String escapeJson(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }
}
