package co.edu.sistemagestiontutoria.service;

import co.edu.sistemagestiontutoria.excepcion.ApiExcepcion;
import co.edu.sistemagestiontutoria.model.Materia;
import co.edu.sistemagestiontutoria.repository.MateriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MateriaService {

    @Autowired
    private MateriaRepository materiaRepository;

    public Materia registrarMateria(Materia materia) {
        if (materia.getNombre() == null || materia.getNombre().isBlank()) {
            throw new ApiExcepcion("Nombre obligatorio", 400);
        }

        if (materiaRepository.existsByNombre(materia.getNombre())) {
            throw new ApiExcepcion("La materia ya está registrada",409);
        }

        return materiaRepository.save(materia);
    }

    public List<Materia> listarMaterias() {

        return materiaRepository.findAll();
    }

    public Materia buscarMateria(int idMateria) {
        return materiaRepository.findById(idMateria).
                orElseThrow(() -> new ApiExcepcion("Materia no encontrada",404));
    }


    public void eliminarMateria(int idMateria) {
        if (!materiaRepository.existsById(idMateria)) {
            throw new ApiExcepcion("Materia no encontrada",404);
        }

        materiaRepository.deleteById(idMateria);
    }
}
