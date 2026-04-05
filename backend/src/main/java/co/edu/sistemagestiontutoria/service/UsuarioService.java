package co.edu.sistemagestiontutoria.service;

import co.edu.sistemagestiontutoria.excepcion.ApiExcepcion;
import co.edu.sistemagestiontutoria.model.Usuario;
import co.edu.sistemagestiontutoria.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario registrarUsuario(Usuario usuario){
        if (usuario.getNombre() == null || usuario.getNombre().isBlank())
            throw new ApiExcepcion("Nombre obligatorio",400);
        if (usuario.getApellido() == null || usuario.getApellido().isBlank())
            throw new ApiExcepcion("Apellido obligatorio",400);
        if (usuario.getEmail() == null || usuario.getEmail().isBlank())
            throw new ApiExcepcion("Correo obligatorio",400);
        if(usuario.getPasswordHash() == null || usuario.getPasswordHash().isBlank())
            throw new ApiExcepcion("Contraseña obligatoria",400);
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new ApiExcepcion("El correo ya está registrado",409);
        }

        usuario.setPasswordHash(passwordEncoder.encode(usuario.getPasswordHash()));
        return usuarioRepository.save(usuario);
    }

    public Usuario ingresar(String email, String password){
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ApiExcepcion("Correo incorrecto o no registrado",404));

        // Verificar contraseña
        if (!passwordEncoder.matches(password, usuario.getPasswordHash())) {
            throw new ApiExcepcion("Contraseña incorrecta",401);
        }
        return usuario;
    }

    //listar
    public List<Usuario> listarUsuario() {
        return usuarioRepository.findAll();
    }

    public void eliminar(int id) {
        if (!usuarioRepository.existsById(id))
            throw new ApiExcepcion("Usuario no encontrado",404);
        usuarioRepository.deleteById(id);
    }

}
