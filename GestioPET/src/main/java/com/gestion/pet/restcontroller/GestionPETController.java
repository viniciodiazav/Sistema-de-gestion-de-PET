package com.gestion.pet.restcontroller;

// --- Imports existentes ---
import com.gestion.pet.modelo.Proveedor;
import com.gestion.pet.repositorios.ProveedorRepositorio;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// --- Nuevos imports para Material ---
import com.gestion.pet.modelo.Material;
import com.gestion.pet.repositorios.MaterialRepositorio;
import org.springframework.http.HttpStatus; // Para crear respuestas

@RestController
@RequestMapping("/produccion")
@CrossOrigin(origins = "*")
public class GestionPETController {
    
    @Autowired
    private ProveedorRepositorio proveedorRepo;
    
    // --- NUEVO: Inyección del Repositorio de Material ---
    @Autowired
    private MaterialRepositorio materialRepo;
    
    
    // ==========================================================
    // ENDPOINTS DE PROVEEDORES (Sin cambios)
    // ==========================================================
    
    /**
     * Endpoint para OBTENER todos los proveedores.
     */
    @GetMapping("/proveedores")
    public List<Proveedor> getProveedores() {
        return proveedorRepo.findAll();
    }
    
    /**
     * Endpoint para CREAR un nuevo proveedor.
     */
    @PostMapping("/proveedor")
    public Proveedor guardarProveedor(@Valid @RequestBody Proveedor proveedor) {
        return proveedorRepo.save(proveedor);
    }
    
    /**
     * Endpoint para ELIMINAR un proveedor por su ID.
     */
    @DeleteMapping("/proveedor/{id}")
    public ResponseEntity<Void> eliminarProveedor(@PathVariable(name = "id") long id) {
        Proveedor proveedor = proveedorRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontro un proveedor con ese ID: " + id));
        
        proveedorRepo.delete(proveedor);
        return ResponseEntity.ok().build();
    }

    /**
     * Endpoint para ACTUALIZAR un proveedor existente por su ID.
     */
    @PutMapping("/proveedor/{id}")
    public Proveedor editarProveedor(@PathVariable(name = "id") long id, 
                                     @Valid @RequestBody Proveedor proveedorConNuevosDatos) {
        
        Proveedor proveedorExistente = proveedorRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontro un proveedor con ese ID: " + id));

        proveedorExistente.setContacto(proveedorConNuevosDatos.getContacto());
        proveedorExistente.setCorreo(proveedorConNuevosDatos.getCorreo());
        proveedorExistente.setNombre(proveedorConNuevosDatos.getNombre());
        proveedorExistente.setDireccion(proveedorConNuevosDatos.getDireccion());
        proveedorExistente.setTelefono(proveedorConNuevosDatos.getTelefono());
        
        return proveedorRepo.save(proveedorExistente);
    }
    
    @GetMapping("/materiales")
    public List<Material> getMateriales() {
        return materialRepo.findAll();
    }
    
    /**
     * Endpoint para CREAR un nuevo material.
     */
    @PostMapping("/material")
    public ResponseEntity<Material> guardarMaterial(@Valid @RequestBody Material material) {
        // Validación simple para evitar duplicados por nombre
        if (materialRepo.findByNombre(material.getNombre()).isPresent()) {
            // Retorna un 409 Conflict si el nombre ya existe
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); 
        }
        Material nuevoMaterial = materialRepo.save(material);
        // Retorna un 201 Created con el objeto creado
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoMaterial); 
    }
    
    /**
     * Endpoint para ACTUALIZAR un material existente por su ID.
     */
    @PutMapping("/material/{id}")
    public Material editarMaterial(@PathVariable(name = "id") long id, 
                                   @Valid @RequestBody Material materialNuevosDatos) {
        
        Material materialExistente = materialRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontro un material con ese ID: " + id));
        
        materialExistente.setNombre(materialNuevosDatos.getNombre());
        materialExistente.setDescripcion(materialNuevosDatos.getDescripcion());
        
        return materialRepo.save(materialExistente);
    }
    
    /**
     * Endpoint para ELIMINAR un material por su ID.
     */
    @DeleteMapping("/material/{id}")
    public ResponseEntity<Void> eliminarMaterial(@PathVariable(name = "id") long id) {
        Material material = materialRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("No se encontro un material con ese ID: " + id));
        
        materialRepo.delete(material);
        return ResponseEntity.ok().build();
    }
}