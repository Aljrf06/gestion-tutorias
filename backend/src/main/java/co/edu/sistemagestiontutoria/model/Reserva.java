package co.edu.sistemagestiontutoria.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor
@Entity
@Table (name= "reservas")
public class Reserva {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;


    @ManyToOne
    @JoinColumn(name = "estudiante_id", nullable = false)
    @JsonIgnoreProperties({"reservas"})
    private Usuario estudiante;

    @ManyToOne
    @JoinColumn(name = "franja_horaria_id", nullable = false)
    @JsonIgnoreProperties({"reservas"})
    private FranjaHoraria franjaHoraria;

    @Enumerated(EnumType.STRING)
    private EstadoReserva estado;

    private LocalDateTime fechaReserva;
    private LocalDateTime fechaCancelacion;

    @Column(columnDefinition = "TEXT")
    private String motivoCancelacion;
}
