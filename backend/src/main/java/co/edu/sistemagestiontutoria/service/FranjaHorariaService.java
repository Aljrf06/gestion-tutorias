package co.edu.sistemagestiontutoria.service;

import co.edu.sistemagestiontutoria.excepcion.ApiExcepcion;
import co.edu.sistemagestiontutoria.model.*;
import co.edu.sistemagestiontutoria.repository.FranjaHorariaRepository;
import co.edu.sistemagestiontutoria.repository.MateriaRepository;
import co.edu.sistemagestiontutoria.repository.ReservaRepository;
import co.edu.sistemagestiontutoria.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FranjaHorariaService {
    @Autowired
    private FranjaHorariaRepository franjaHorariaRepository;
    @Autowired
    private MateriaRepository materiaRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private ReservaRepository reservaRepository;

    public FranjaHoraria crearFranja(FranjaHoraria franja) {
        Materia materia = materiaRepository.findById(franja.getMateria().getId())
                .orElseThrow(() -> new ApiExcepcion("Materia no encontrada", 404));

        Usuario tutor = usuarioRepository.findById(franja.getTutor().getId())
                .orElseThrow(() -> new ApiExcepcion("Tutor no encontrado", 404));


        if (tutor.getTipo() == null || !tutor.getTipo().equals(TipoUsuario.tutor))
            throw new ApiExcepcion("El usuario no es tutor", 400);

        franja.setTutor(tutor);
        franja.setMateria(materia);
        franja.setEstado(EstadoFranja.disponible);
        return franjaHorariaRepository.save(franja);
    }

    public List<FranjaHoraria> listarTodas() {
        return franjaHorariaRepository.findAll();
    }

    public List<FranjaHoraria> listarPorTutor(int tutorId) {
        return franjaHorariaRepository.findByTutorId(tutorId);
    }

    public List<FranjaHoraria> listarPorMateria(int materiaId) {
        return franjaHorariaRepository.findByMateriaId(materiaId);
    }

    public FranjaHoraria buscarPorId(int id) {
        return franjaHorariaRepository.findById(id)
                .orElseThrow(() -> new ApiExcepcion("Franja horaria no encontrada", 404));
    }

    public FranjaHoraria actualizarFranja(int id, FranjaHoraria franja) {
        if (!franjaHorariaRepository.existsById(id))
            throw new ApiExcepcion("Franja horaria no encontrada", 404);
        franja.setId(id);
        return franjaHorariaRepository.save(franja);
    }
    @Transactional
    public void eliminarFranja(int id) {
        if (!franjaHorariaRepository.existsById(id))
            throw new ApiExcepcion("Franja horaria no encontrada", 404);
        reservaRepository.deleteByFranjaHorariaId(id);
        franjaHorariaRepository.deleteById(id);
    }
}
