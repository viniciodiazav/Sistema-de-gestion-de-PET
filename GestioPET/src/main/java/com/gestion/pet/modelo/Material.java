package com.gestion.pet.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "materiales") // Define el nombre de la tabla
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank(message = "El nombre del material no puede estar vacío")
    @Size(min = 3, message = "El nombre debe tener al menos 3 caracteres")
    @Column(name = "nombre", nullable = false, unique = true)
    private String nombre;
    
    // La descripción es opcional, por lo que no lleva @NotBlank
    @Column(name = "descripcion")
    private String descripcion;

    // Constructor vacío requerido por JPA
    public Material() {
    }

    // Constructor para crear nuevos materiales
    public Material(String nombre, String descripcion) {
        this.nombre = nombre;
        this.descripcion = descripcion;
    }

    // --- Getters y Setters ---

    public long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}