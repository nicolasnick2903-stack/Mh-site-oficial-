package com.mhfacilities.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mhfacilities.entity.Chamado;
import com.mhfacilities.repository.ChamadoRepository;
import com.mhfacilities.repository.NotificacaoRepository;
import com.mhfacilities.service.ChamadoService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class ChamadoController {

    private final ChamadoService chamadoService;
    private final ChamadoRepository chamadoRepository;
    private final NotificacaoRepository notificacaoRepository;

    public ChamadoController(
        ChamadoService chamadoService,
        ChamadoRepository chamadoRepository,
        NotificacaoRepository notificacaoRepository
    ) {
        this.chamadoService = chamadoService;
        this.chamadoRepository = chamadoRepository;
        this.notificacaoRepository = notificacaoRepository;
    }

    @PostMapping("/chamados")
    public ResponseEntity<ChamadoResponse> criarChamado(@RequestBody CriarChamadoRequest request) {
        Chamado chamado = chamadoService.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ChamadoResponse.from(chamado));
    }

    @PatchMapping("/chamados/{id}/status")
    public ChamadoResponse atualizarStatus(@PathVariable Long id, @RequestBody AtualizarStatusRequest request) {
        return ChamadoResponse.from(chamadoService.atualizarStatus(id, request.getStatus()));
    }

    @GetMapping("/admin/chamados")
    public List<ChamadoResponse> listarChamados() {
        return chamadoRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(ChamadoResponse::from)
            .toList();
    }

    @GetMapping("/admin/notificacoes")
    public List<NotificacaoResponse> listarNotificacoes() {
        return notificacaoRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(NotificacaoResponse::from)
            .toList();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }
}
