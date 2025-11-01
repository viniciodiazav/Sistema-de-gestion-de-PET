package com.gestion.pet.restcontroller;

import com.gestion.pet.modelo.Proveedor;
import com.gestion.pet.repositorios.ProveedorRepositorio;
import jakarta.validation.Valid; // Importamos @Valid
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; // Para respuestas HTTP
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/produccion")
@CrossOrigin(origins = "*")
public class GestionPETController {
    
    @Autowired
    private ProveedorRepositorio proveedorRepo;
    
    /**
     * Endpoint para OBTENER todos los proveedores.
     */
    @GetMapping("/proveedores")
    public List<Proveedor> getProveedores() {
        return proveedorRepo.findAll();
    }
    
    /**
     * Endpoint para CREAR un nuevo proveedor.
     * @Valid activa las validaciones de la entidad Proveedor.
     */
    @PostMapping("/proveedor")
    public Proveedor guardarProveedor(@Valid @RequestBody Proveedor proveedor) {
        // La validación @Valid reemplaza la necesidad de "if (proveedor == null)"
        return proveedorRepo.save(proveedor);
    }
    
    /**
     * Endpoint para ELIMINAR un proveedor por su ID.
     */
    @DeleteMapping("/proveedor/{id}")
    public ResponseEntity<Void> eliminarProveedor(@PathVariable(name = "id") long id) {
        // Buscamos al proveedor. Si no existe, lanzará una excepción.
        Proveedor proveedor = proveedorRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontro un proveedor con ese ID: " + id));
        
        // Si existe, lo eliminamos.
        proveedorRepo.delete(proveedor);
        return ResponseEntity.ok().build(); // Retorna un HTTP 200 OK vacío
    }

    /**
     * Endpoint para ACTUALIZAR un proveedor existente por su ID.
     */
    @PutMapping("/proveedor/{id}")
    public Proveedor editarProveedor(@PathVariable(name = "id") long id, 
                                     @Valid @RequestBody Proveedor proveedorConNuevosDatos) {
        
        // 1. Buscar el proveedor existente. Si no existe, lanza excepción.
        Proveedor proveedorExistente = proveedorRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontro un proveedor con ese ID: " + id));

        // 2. Actualizar los campos del proveedor existente con los datos nuevos.
        proveedorExistente.setContacto(proveedorConNuevosDatos.getContacto());
        proveedorExistente.setCorreo(proveedorConNuevosDatos.getCorreo());
        proveedorExistente.setNombre(proveedorConNuevosDatos.getNombre());
        proveedorExistente.setDireccion(proveedorConNuevosDatos.getDireccion());
        proveedorExistente.setTelefono(proveedorConNuevosDatos.getTelefono());
        
        // 3. Guardar y retornar el proveedor actualizado.
        return proveedorRepo.save(proveedorExistente);
    }
}