package co.edu.sistemagestiontutoria.controller;


import co.edu.sistemagestiontutoria.model.FranjaHoraria;
import co.edu.sistemagestiontutoria.model.Reserva;
import co.edu.sistemagestiontutoria.service.FranjaHorariaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/franjas-horarias")
@CrossOrigin(origins = "*")
public class FranjaHorariaController {
    @Autowired
    FranjaHorariaService franjaHorariaService;

    @PostMapping("/crearFranja")
    public ResponseEntity<FranjaHoraria> crearFranja(@RequestBody FranjaHoraria franja){
        FranjaHoraria franjaNueva = franjaHorariaService.crearFranja(franja);
        return ResponseEntity.status(HttpStatus.CREATED).body(franjaNueva);
    }

    @GetMapping("/listarFranjas")
    public ResponseEntity<List<FranjaHoraria>> listarFranjas() {
        return ResponseEntity.ok(franjaHorariaService.listarTodas());
    }

    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<FranjaHoraria>> listarPorTutor(@PathVariable int tutorId) {
        return ResponseEntity.ok(franjaHorariaService.listarPorTutor(tutorId));
    }

    @GetMapping("/materia/{materiaId}")
    public ResponseEntity<List<FranjaHoraria>> listarPorMateria(@PathVariable int materiaId) {
        return ResponseEntity.ok(franjaHorariaService.listarPorMateria(materiaId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FranjaHoraria> buscarPorId(@PathVariable int id) {
        return ResponseEntity.ok(franjaHorariaService.buscarPorId(id));
    }
    //tutor actualiza franja
    @PutMapping("/{id}")
    public ResponseEntity<FranjaHoraria> actualizarFranja(@PathVariable int id,
                                                          @RequestBody FranjaHoraria franja) {
        return ResponseEntity.ok(franjaHorariaService.actualizarFranja(id, franja));
    }

    // Tutor elimina franja
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarFranja(@PathVariable int id) {
        franjaHorariaService.eliminarFranja(id);
        return ResponseEntity.noContent().build();
    }



}
