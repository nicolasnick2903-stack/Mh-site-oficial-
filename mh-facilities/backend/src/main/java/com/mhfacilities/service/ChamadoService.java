package com.mhfacilities.service;

import java.time.LocalDateTime;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mhfacilities.controller.CriarChamadoRequest;
import com.mhfacilities.entity.CategoriaChamado;
import com.mhfacilities.entity.Chamado;
import com.mhfacilities.entity.Condominio;
import com.mhfacilities.entity.PrioridadeChamado;
import com.mhfacilities.entity.StatusChamado;
import com.mhfacilities.repository.ChamadoRepository;
import com.mhfacilities.repository.CondominioRepository;

@Service
public class ChamadoService {

    private final ChamadoRepository chamadoRepository;
    private final CondominioRepository condominioRepository;
    private final NotificationService notificationService;

    public ChamadoService(
        ChamadoRepository chamadoRepository,
        CondominioRepository condominioRepository,
        NotificationService notificationService
    ) {
        this.chamadoRepository = chamadoRepository;
        this.condominioRepository = condominioRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Chamado criar(CriarChamadoRequest request) {
        validarObrigatorio(request.getSindicoNome(), "Nome do sindico");
        validarObrigatorio(request.getSindicoEmail(), "Email do sindico");
        validarObrigatorio(request.getCondominioNome(), "Condominio");
        validarObrigatorio(request.getCategoria(), "Categoria");
        validarObrigatorio(request.getPrioridade(), "Prioridade");
        validarObrigatorio(request.getAssunto(), "Assunto");
        validarObrigatorio(request.getDescricao(), "Descricao");

        Condominio condominio = condominioRepository.findByNomeIgnoreCase(request.getCondominioNome().trim())
            .orElseGet(() -> criarCondominio(request.getCondominioNome().trim()));

        Chamado chamado = new Chamado();
        chamado.setCondominio(condominio);
        chamado.setSindicoNome(request.getSindicoNome().trim());
        chamado.setSindicoCpf(trim(request.getSindicoCpf()));
        chamado.setSindicoEmail(request.getSindicoEmail().trim());
        chamado.setSindicoTelefone(trim(request.getSindicoTelefone()));
        chamado.setCategoria(parseEnum(CategoriaChamado.class, request.getCategoria()));
        chamado.setPrioridade(parseEnum(PrioridadeChamado.class, request.getPrioridade()));
        chamado.setAssunto(request.getAssunto().trim());
        chamado.setDescricao(request.getDescricao().trim());

        chamado = chamadoRepository.save(chamado);
        chamado.setNumero("#" + String.format("%06d", chamado.getId()));
        chamado = chamadoRepository.save(chamado);

        notificationService.notificarNovoChamado(chamado);
        return chamado;
    }

    @Transactional
    public Chamado atualizarStatus(Long id, String novoStatus) {
        Chamado chamado = chamadoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Chamado nao encontrado"));

        StatusChamado status = parseEnum(StatusChamado.class, novoStatus);
        chamado.setStatus(status);
        chamado.setUpdatedAt(LocalDateTime.now());
        chamado = chamadoRepository.save(chamado);

        notificationService.notificarAtualizacaoStatus(chamado, status);
        return chamado;
    }

    private Condominio criarCondominio(String nome) {
        Condominio condominio = new Condominio();
        condominio.setNome(nome);
        return condominioRepository.save(condominio);
    }

    private void validarObrigatorio(String value, String campo) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(campo + " e obrigatorio");
        }
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }

    private <T extends Enum<T>> T parseEnum(Class<T> enumType, String value) {
        if (value == null) {
            throw new IllegalArgumentException("Valor invalido");
        }

        String normalized = value.trim()
            .replace("ç", "c")
            .replace("Ç", "C")
            .replace("ã", "a")
            .replace("Ã", "A")
            .replace("é", "e")
            .replace("É", "E")
            .replace("í", "i")
            .replace("Í", "I")
            .replace(" ", "_")
            .toUpperCase(Locale.ROOT);

        return Enum.valueOf(enumType, normalized);
    }
}
