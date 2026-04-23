package co.edu.sistemagestiontutoria.DTO;

import co.edu.sistemagestiontutoria.model.TipoUsuario;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioRespuestaDTO {
    private int id;
    private String nombre;
    private String apellido;
    private String email;
    private TipoUsuario tipo;
    private String token;
}