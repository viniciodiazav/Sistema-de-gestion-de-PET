package com.gestion.pet.repositorios;

import com.gestion.pet.modelo.Material;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialRepositorio extends JpaRepository<Material, Long> {
    
    // Método opcional para buscar por nombre, útil para validaciones
    Optional<Material> findByNombre(String nombre);
}