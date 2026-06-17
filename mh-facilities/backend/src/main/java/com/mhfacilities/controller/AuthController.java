package com.mhfacilities.controller;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mhfacilities.entity.Usuario;
import com.mhfacilities.repository.UsuarioRepository;
import com.mhfacilities.controller.RegisterRequest;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank() || request.getSenha() == null || request.getSenha().isBlank()) {
            return ResponseEntity.badRequest().body("Email e senha são obrigatórios");
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail());
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário ou senha incorretos");
        }

        Usuario usuario = usuarioOpt.get();
        if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário ou senha incorretos");
        }

        return ResponseEntity.ok("Login realizado com sucesso para " + usuario.getNome());
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        if (request.getNome() == null || request.getNome().isBlank() || request.getEmail() == null || request.getEmail().isBlank() || request.getTelefone() == null || request.getTelefone().isBlank() || request.getSenha() == null || request.getSenha().isBlank()) {
            return ResponseEntity.badRequest().body("Nome, email, telefone e senha são obrigatórios");
        }

        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Este email já está cadastrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setTelefone(request.getTelefone());
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuarioRepository.save(usuario);

        return ResponseEntity.status(HttpStatus.CREATED).body("Cadastro realizado com sucesso. Faça login para continuar.");
    }
}
