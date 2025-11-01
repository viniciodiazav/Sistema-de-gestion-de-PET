/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/springframework/Repository.java to edit this template
 */
package com.gestion.pet.repositorios;

import com.gestion.pet.modelo.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 *
 * @author T590
 */
@Repository
public interface ProveedorRepositorio extends JpaRepository<Proveedor, Long> {
    
}
