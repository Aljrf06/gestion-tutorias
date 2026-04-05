package co.edu.sistemagestiontutoria.repository;

import co.edu.sistemagestiontutoria.model.EstadoFranja;
import co.edu.sistemagestiontutoria.model.FranjaHoraria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FranjaHorariaRepository extends JpaRepository<FranjaHoraria,Integer> {
    List<FranjaHoraria> findByEstado(EstadoFranja estado);
    List<FranjaHoraria> findByTutorId(int tutorId);
    List<FranjaHoraria> findByMateriaId(int materiaId);

}
