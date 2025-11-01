/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.gestion.pet.restcontroller;

import com.gestion.pet.modelo.Proveedor;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.gestion.pet.repositorios.ProveedorRepositorio;
import java.util.Optional;

/**
 *
 * @author T590
 */
@RestController
@RequestMapping("/produccion")
@CrossOrigin(origins = "*")
public class GestionPETController {
    
    @Autowired
    private ProveedorRepositorio proveedorRepo;
    
    @GetMapping("/proveedores")
    public List<Proveedor> getProveedores() {
        return proveedorRepo.findAll();
    }
    
    @PostMapping("/proveedor")
    public Proveedor guardarProveedor(@RequestBody Proveedor proveedor) {
        if (proveedor == null) {
            throw new IllegalArgumentException("El proveedor no puede ser nulo");
        }
        return proveedorRepo.save(proveedor);
    }
    
    @DeleteMapping("/proveedor/{id}")
    public void eliminarProveedor(@PathVariable(name = "id") long id) {
        Optional<Proveedor> proveedorDelete = proveedorRepo.findById(id);
        if (proveedorDelete.isPresent()) {
            Proveedor proveedor = proveedorDelete.get();
            if (proveedor != null) {
                proveedorRepo.delete(proveedor);
            }
        } else {
            throw new RuntimeException("No se encontro un proveedor con ese ID");
        }
    }

    @PutMapping("/proveedor/{id}")
    public Proveedor editarProveedor(@PathVariable(name = "id") long id, @RequestBody Proveedor proveedor) {
        Optional<Proveedor> provedorEditar = proveedorRepo.findById(id);
        if (provedorEditar.isPresent()) {
            Proveedor proveedorAGuardar = provedorEditar.get();
            proveedorAGuardar.setContacto(proveedor.getContacto());
            proveedorAGuardar.setCorreo(proveedor.getCorreo());
            proveedorAGuardar.setNombre(proveedor.getNombre());
            proveedorAGuardar.setDireccion(proveedor.getDireccion());
            proveedorAGuardar.setTelefono(proveedor.getTelefono());
            return proveedorRepo.save(proveedorAGuardar);
        } else {
            return null;
        }
    }
    
}
