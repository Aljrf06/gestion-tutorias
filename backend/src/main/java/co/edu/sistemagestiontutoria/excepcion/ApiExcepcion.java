package co.edu.sistemagestiontutoria.excepcion;

public class ApiExcepcion extends RuntimeException {
    private final int status;

    public ApiExcepcion(String mensaje, int status) {
        super(mensaje);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}