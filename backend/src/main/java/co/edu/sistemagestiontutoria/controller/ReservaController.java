package co.edu.sistemagestiontutoria.controller;


import co.edu.sistemagestiontutoria.model.Reserva;
import co.edu.sistemagestiontutoria.service.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {
    @Autowired
    ReservaService reservaService;

    @PostMapping("/crearReserva")
    public ResponseEntity<Reserva> crearReserva(@RequestBody Reserva reserva){
        Reserva reservaNueva = reservaService.crearReserva(reserva);
        return ResponseEntity.status(HttpStatus.CREATED).body(reservaNueva);
    }

    @GetMapping("/listarReservas")
    public ResponseEntity<List<Reserva>> listarReserva() {
        return ResponseEntity.ok(reservaService.listarReserva());
    }

    @GetMapping("/estudiante/{estudianteId}")
    public ResponseEntity<List<Reserva>> listarPorEstudiante(@PathVariable int estudianteId) {
        return ResponseEntity.ok(reservaService.listarPorEstudiante(estudianteId));
    }

    @PutMapping("/cancelar/{id}")
    public ResponseEntity<Reserva> cancelarReserva(@PathVariable int id,
                                                   @RequestParam String motivo) {
        return ResponseEntity.ok(reservaService.cancelarReserva(id, motivo));
    }

}
