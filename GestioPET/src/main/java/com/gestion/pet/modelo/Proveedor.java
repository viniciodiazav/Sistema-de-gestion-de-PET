package com.gestion.pet.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
// Importamos las validaciones
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "proveedores")
public class Proveedor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private long id;
    
    // El nombre no puede ser nulo o vacío
    @NotBlank(message = "El nombre no puede estar vacío")
    @Column(name = "nombre", nullable = false)
    private String nombre;
    
    // El contacto no puede ser nulo o vacío
    @NotBlank(message = "El contacto no puede estar vacío")
    @Column(name = "contacto", nullable = false)
    private String contacto;

    // El teléfono debe tener entre 10 y 15 dígitos
    @NotBlank(message = "El teléfono no puede estar vacío")
    @Size(min = 10, max = 15, message = "El teléfono debe tener entre 10 y 15 dígitos")
    @Column(name = "telefono", nullable = false)
    private String telefono;

    // El correo debe ser un email válido y único
    @NotBlank(message = "El correo no puede estar vacío")
    @Email(message = "El formato del correo no es válido")
    @Column(name = "correo", nullable = false, unique = true) 
    private String correo;
    
    // La dirección no puede estar vacía
    @NotBlank(message = "La dirección no puede estar vacía")
    @Column(name = "direccion", nullable = false)
    private String direccion;

    public Proveedor() {
    }

    public Proveedor(String nombre, String contacto, String telefono, String correo, String direccion) {
        this.nombre = nombre;
        this.contacto = contacto;
        this.telefono = telefono;
        this.correo = correo;
        this.direccion = direccion;
    }

    // Getters y Setters (sin cambios)
    
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getContacto() {
        return contacto;
    }

    public void setContacto(String contacto) {
        this.contacto = contacto;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public long getId() {
        return id;
    }
}