package co.edu.sistemagestiontutoria.excepcion;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

@RestControllerAdvice
public class GlobalExcepcionHandler {

    @ExceptionHandler(ApiExcepcion.class)
    public ResponseEntity<?> manejarApiExcepcion(ApiExcepcion ex) {
        return ResponseEntity
                .status(ex.getStatus())
                .body(Map.of(
                        "status", ex.getStatus(),
                        "mensaje", ex.getMessage()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> manejarErrorGeneral(Exception ex) {
        return ResponseEntity
                .status(500)
                .body(Map.of(
                        "status", 500,
                        "mensaje", "Error interno del servidor"
                ));
    }
}