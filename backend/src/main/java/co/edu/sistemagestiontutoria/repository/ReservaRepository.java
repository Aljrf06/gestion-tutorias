package co.edu.sistemagestiontutoria.repository;

import co.edu.sistemagestiontutoria.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Integer> {
    List<Reserva> findByEstudianteId(int estudianteId);
}
