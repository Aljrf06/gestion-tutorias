package co.edu.sistemagestiontutoria.service;


import co.edu.sistemagestiontutoria.excepcion.ApiExcepcion;
import co.edu.sistemagestiontutoria.model.EstadoFranja;
import co.edu.sistemagestiontutoria.model.EstadoReserva;
import co.edu.sistemagestiontutoria.model.FranjaHoraria;
import co.edu.sistemagestiontutoria.model.Reserva;
import co.edu.sistemagestiontutoria.repository.FranjaHorariaRepository;
import co.edu.sistemagestiontutoria.repository.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservaService {
    @Autowired
    private ReservaRepository reservaRepository;
    @Autowired
    private FranjaHorariaRepository franjaHorariaRepository;


    public Reserva crearReserva(Reserva reserva) {
        FranjaHoraria franja = franjaHorariaRepository.findById(reserva.getFranjaHoraria().getId())
                .orElseThrow(() -> new ApiExcepcion("Franja horaria no encontrada", 404));

        if (!franja.getEstado().equals(EstadoFranja.disponible))
            throw new ApiExcepcion("La franja horaria no está disponible", 400);

        // Cambia estado de la franja a reservada
        franja.setEstado(EstadoFranja.reservada);
        franjaHorariaRepository.save(franja);

        reserva.setEstado(EstadoReserva.activa);
        reserva.setFechaReserva(LocalDateTime.now());
        return reservaRepository.save(reserva);
    }

    public List<Reserva> listarPorEstudiante(int estudianteId){
        return reservaRepository.findByEstudianteId(estudianteId);
    }

    public List<Reserva> listarReserva(){
        return reservaRepository.findAll();
    }

    public Reserva cancelarReserva(int id, String motivo) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ApiExcepcion("Reserva no encontrada", 404));

        if (reserva.getEstado().equals(EstadoReserva.cancelada))
            throw new ApiExcepcion("La reserva ya está cancelada", 400);

        // Actualizar la reserva
        reserva.setEstado(EstadoReserva.cancelada);
        reserva.setFechaCancelacion(LocalDateTime.now());
        reserva.setMotivoCancelacion(motivo);

        // Liberar franja horaria
        FranjaHoraria franja = reserva.getFranjaHoraria();
        franja.setEstado(EstadoFranja.disponible);
        franjaHorariaRepository.save(franja);

        return reservaRepository.save(reserva);
    }

}
