package co.edu.sistemagestiontutoria.repository;

import co.edu.sistemagestiontutoria.model.Materia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MateriaRepository extends JpaRepository<Materia,Integer> {
    Optional<Materia> findByNombre(String nombre);
    boolean existsByNombre(String nombre);
}
