package co.edu.sistemagestiontutoria.controller;

import co.edu.sistemagestiontutoria.DTO.LoginDTO;
import co.edu.sistemagestiontutoria.DTO.RegistroUsuarioDTO;
import co.edu.sistemagestiontutoria.DTO.UsuarioRespuestaDTO;
import co.edu.sistemagestiontutoria.model.Usuario;
import co.edu.sistemagestiontutoria.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/registrar")
    public ResponseEntity<UsuarioRespuestaDTO> registrarUsuario(@RequestBody RegistroUsuarioDTO request) {
        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setEmail(request.getEmail());
        usuario.setPasswordHash(request.getPassword());
        usuario.setTipo(request.getTipo());

        Usuario nuevo = usuarioService.registrarUsuario(usuario);

        UsuarioRespuestaDTO respuesta = new UsuarioRespuestaDTO(
                nuevo.getId(),
                nuevo.getNombre(),
                nuevo.getApellido(),
                nuevo.getEmail(),
                nuevo.getTipo()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @GetMapping("/listarUsuario")
    public ResponseEntity<List<UsuarioRespuestaDTO>> listarUsuario() {
        List<UsuarioRespuestaDTO> respuesta = usuarioService.listarUsuario().stream()
                .map(usuario -> new UsuarioRespuestaDTO(
                        usuario.getId(),
                        usuario.getNombre(),
                        usuario.getApellido(),
                        usuario.getEmail(),
                        usuario.getTipo()
                ))
                .toList();

        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioRespuestaDTO> login(@RequestBody LoginDTO request) {
        Usuario usuario = usuarioService.ingresar(request.getEmail(), request.getPassword());

        UsuarioRespuestaDTO respuesta = new UsuarioRespuestaDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getEmail(),
                usuario.getTipo()
        );

        return ResponseEntity.ok(respuesta);
    }
}
