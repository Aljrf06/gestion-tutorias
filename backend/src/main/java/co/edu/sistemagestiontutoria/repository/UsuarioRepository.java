package co.edu.sistemagestiontutoria.repository;

import co.edu.sistemagestiontutoria.model.TipoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import co.edu.sistemagestiontutoria.model.Usuario;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Usuario> findByTipo(TipoUsuario tipo);
}
