package co.edu.sistemagestiontutoria.DTO;

import co.edu.sistemagestiontutoria.model.TipoUsuario;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegistroUsuarioDTO {
    private String nombre;
    private String apellido;
    private String email;
    private String password;
    private TipoUsuario tipo;
}
