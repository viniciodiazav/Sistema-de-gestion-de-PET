/**
 * ===================================================================
 * SCRIPT DE MATERIALES (materiales.js)
 * * Maneja la lógica de la página de Materiales:
 * - Cargar y Mostrar Materiales (GET)
 * - Registrar Nuevos Materiales (POST)
 * - Editar Materiales (PUT)
 * - Eliminar Materiales (DELETE)
 * - Validación de formularios con mensajes
 * ===================================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Constantes y Variables ---
    const API_URL = 'http://localhost:8080/produccion'; // URL base del backend
    let materialesCargados = []; // Caché local
    let idParaEliminar = null; // Variable para guardar el ID al eliminar
    let textoValidacionEliminar = 'eliminar'; // Texto base para confirmación

    // --- Elementos de la PÁGINA (Formulario de CREAR) ---
    const formNuevoMaterial = document.getElementById('form-nuevo-material');
    const nombreInput = document.getElementById('mat-nombre');
    const errorNombreNuevo = document.getElementById('error-mat-nombre'); // Mensaje de error
    const descripcionInput = document.getElementById('mat-descripcion');
    const submitButtonNuevo = formNuevoMaterial.querySelector('button[type="submit"]');
    // --- searchInput ELIMINADO ---
    
    const listContainer = document.getElementById('materiales-list-container');
    const emptyState = document.getElementById('materiales-empty-state');
    
    // --- Elementos del MODAL de EDICIÓN ---
    const modalEditar = document.getElementById('modal-editar-material');
    const formEditar = document.getElementById('form-editar-material');
    const editIdInput = document.getElementById('edit-mat-id');
    const editNombreInput = document.getElementById('edit-mat-nombre');
    const errorNombreEditar = document.getElementById('error-edit-mat-nombre'); // Mensaje de error
    const editDescripcionInput = document.getElementById('edit-mat-descripcion');
    const submitButtonEditar = formEditar.querySelector('button[type="submit"]');
    const closeModalBtn = document.getElementById('modal-close-material');

    // --- Elementos del MODAL de ELIMINACIÓN ---
    const deleteModal = document.getElementById('modal-confirmar-delete-material');
    const closeDeleteBtn = document.getElementById('modal-close-delete-material');
    const confirmInputDelete = document.getElementById('delete-confirm-input-material');
    const finalDeleteBtn = document.getElementById('btn-final-delete-material');
    const deleteMaterialNameSpan = document.getElementById('delete-material-name');
    const deleteValidationTextSpan = document.getElementById('delete-material-validation-text');


    // --- 2. Carga Inicial ---
    cargarMateriales();
    submitButtonNuevo.disabled = true; // Deshabilita el botón de registrar al inicio

    // --- 3. Funciones Principales ---

    /**
     * Busca los materiales en la API (GET) y los muestra como tarjetas.
     */
    function cargarMateriales() {
        fetch(`${API_URL}/materiales`)
            .then(respuesta => {
                if (!respuesta.ok) {
                    throw new Error(`Error HTTP ${respuesta.status}`);
                }
                return respuesta.json();
            })
            .then(materiales => {
                materialesCargados = materiales || [];
                // Llama a renderizar con la lista completa
                renderizarMateriales(materialesCargados);
                
                validarFormularioNuevo();
            })
            .catch(e => {
                console.error("Hubo un error al cargar los materiales:", e);
                listContainer.innerHTML = `<p style="color: red;">Error al cargar materiales: ${e.message}. Asegúrate que el backend esté encendido.</p>`;
                emptyState.classList.add('hidden');
            });
    }

    /**
     * Dibuja las tarjetas de material en el HTML.
     * @param {Array} materiales - El array de materiales a mostrar.
     */
    function renderizarMateriales(materiales) {
        
        listContainer.innerHTML = ''; // Limpia el contenedor
        
        // Configura el texto del estado vacío por defecto
        emptyState.querySelector('h3').textContent = 'No hay materiales registrados';
        emptyState.querySelector('p').textContent = 'Añade un nuevo material usando el formulario de arriba.';

        if (materiales.length > 0) {
            emptyState.classList.add('hidden'); // Oculta el estado vacío
            
            materiales.forEach(material => {
                const card = document.createElement('div');
                card.className = 'material-card'; 
                card.dataset.id = material.id;
                
                const descripcion = material.descripcion || 'Sin descripción';
                
                card.innerHTML = `
                    <div class="material-card-header">
                        <h3 class="material-nombre">${material.nombre}</h3>
                        <div class="material-card-actions">
                            <i class="fas fa-edit btn-editar-material" title="Editar"></i>
                            <i class="fas fa-trash btn-eliminar-material" title="Eliminar"></i>
                        </div>
                    </div>
                    <div class="material-card-body">
                         <p>${descripcion}</p>
                    </div>
                `;
                listContainer.appendChild(card);
            });
            
        } else {
            // Muestra el estado vacío
            emptyState.classList.remove('hidden');
        }
    }
    
    /**
     * Abre el modal de edición
     */
    function abrirModalEditar(id) {
        const material = materialesCargados.find(m => m.id == id);
        if (!material) {
            alert('Error: No se encontró el material.');
            return;
        }
        
        editIdInput.value = material.id;
        editNombreInput.value = material.nombre;
        editDescripcionInput.value = material.descripcion || '';
        
        validarFormularioEditar(); 
        modalEditar.classList.remove('hidden');
    }

    // --- Funciones de Validación con MENSAJES ---

    /**
     * Valida el formulario de NUEVO material en tiempo real.
     */
    function validarFormularioNuevo() {
        const nombreVal = nombreInput.value.trim();
        let esValido = true;
        let mensajeError = '';

        if (nombreVal.length === 0) {
            mensajeError = 'El nombre es obligatorio.';
            esValido = false;
        } else if (nombreVal.length < 3) {
            mensajeError = 'Debe tener al menos 3 caracteres.';
            esValido = false;
        }
        else if (materialesCargados.some(m => m.nombre.toLowerCase() === nombreVal.toLowerCase())) {
            mensajeError = 'Este material ya existe.';
            esValido = false;
        }

        errorNombreNuevo.textContent = mensajeError;
        errorNombreNuevo.classList.toggle('visible', !esValido);
        nombreInput.classList.toggle('invalid', !esValido);
        submitButtonNuevo.disabled = !esValido;
    }
    
    /**
     * Valida el formulario de EDITAR material en tiempo real.
     */
    function validarFormularioEditar() {
        const idActual = editIdInput.value;
        const nombreVal = editNombreInput.value.trim();
        let esValido = true;
        let mensajeError = '';

        if (nombreVal.length === 0) {
            mensajeError = 'El nombre es obligatorio.';
            esValido = false;
        } else if (nombreVal.length < 3) {
            mensajeError = 'Debe tener al menos 3 caracteres.';
            esValido = false;
        }
        else if (materialesCargados.some(
            m => m.nombre.toLowerCase() === nombreVal.toLowerCase() && m.id != idActual
        )) {
            mensajeError = 'Este material ya existe.';
            esValido = false;
        }
        
        errorNombreEditar.textContent = mensajeError;
        errorNombreEditar.classList.toggle('visible', !esValido);
        editNombreInput.classList.toggle('invalid', !esValido);
        submitButtonEditar.disabled = !esValido;
    }

    /**
     * Limpia los estilos de error del formulario de nuevo material
     */
    function limpiarErroresFormularioNuevo() {
        nombreInput.classList.remove('invalid');
        errorNombreNuevo.classList.remove('visible');
        errorNombreNuevo.textContent = '';
        submitButtonNuevo.disabled = true; // Siempre deshabilita al limpiar
    }

    // --- 4. Asignación de Eventos ---

    /**
     * (Formulario CREAR) Valida en tiempo real al escribir
     */
    formNuevoMaterial.addEventListener('input', validarFormularioNuevo);

    /**
     * (Formulario CREAR) Maneja el envío
     */
    formNuevoMaterial.addEventListener('submit', (e) => {
        e.preventDefault(); 
        if (submitButtonNuevo.disabled) return; 

        const nuevoMaterial = {
            nombre: nombreInput.value.trim(),
            descripcion: descripcionInput.value.trim()
        };

        fetch(`${API_URL}/material`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoMaterial),
        })
        .then(async respuesta => {
            if (respuesta.status === 201) return respuesta.json();
            if (respuesta.status === 409) throw new Error('El nombre de este material ya existe.');
            throw new Error(`Error HTTP ${respuesta.status}`);
        })
        .then(() => {
            formNuevoMaterial.reset(); 
            limpiarErroresFormularioNuevo(); 
            cargarMateriales(); 
        })
        .catch(error => {
            console.error('Error al guardar material:', error.message);
            alert(`Error: ${error.message}`);
            validarFormularioNuevo();
        });
    });

    // --- EVENT LISTENER DE BÚSQUEDA ELIMINADO ---
    
    // --- Eventos para MODAL DE EDICIÓN ---
    
    /**
     * (Delegación de eventos) Escucha clics en la lista de materiales
     */
    listContainer.addEventListener('click', (e) => {
        
        // Clic en el botón EDITAR
        if (e.target.classList.contains('btn-editar-material')) {
            const card = e.target.closest('.material-card');
            const id = card.dataset.id;
            abrirModalEditar(id);
        }
        
        // Clic en el botón ELIMINAR
        else if (e.target.classList.contains('btn-eliminar-material')) {
            const card = e.target.closest('.material-card');
            idParaEliminar = parseInt(card.dataset.id); 
            const nombreMaterial = card.querySelector('.material-nombre').textContent;
            
            textoValidacionEliminar = 'eliminar'; 
            deleteMaterialNameSpan.textContent = nombreMaterial;
            deleteValidationTextSpan.textContent = textoValidacionEliminar;
            
            confirmInputDelete.value = '';
            finalDeleteBtn.disabled = true;
            deleteModal.classList.remove('hidden');
        }
    });

    /**
     * (Formulario EDITAR) Valida en tiempo real al escribir
     */
    formEditar.addEventListener('input', validarFormularioEditar);

    /**
     * (Formulario EDITAR) Maneja el envío
     */
    formEditar.addEventListener('submit', (e) => {
        e.preventDefault();
        if (submitButtonEditar.disabled) return;
        
        const id = editIdInput.value;
        const materialEditado = {
            nombre: editNombreInput.value.trim(),
            descripcion: editDescripcionInput.value.trim()
        };

        fetch(`${API_URL}/material/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(materialEditado),
        })
        .then(async respuesta => {
            if (!respuesta.ok) {
                 if (respuesta.status === 409) throw new Error('Ese nombre de material ya existe.');
                throw new Error(`Error HTTP ${respuesta.status}`);
            }
            return respuesta.json();
        })
        .then(() => {
            modalEditar.classList.add('hidden'); 
            cargarMateriales(); 
        })
        .catch(error => {
            console.error('Error al editar material:', error.message);
            alert(`Error: ${error.message}`);
            validarFormularioEditar();
        });
    });

    /**
     * Cierra el modal de edición
     */
    closeModalBtn.addEventListener('click', () => {
        modalEditar.classList.add('hidden');
    });

    modalEditar.addEventListener('click', (event) => {
        if (event.target === modalEditar) {
            modalEditar.classList.add('hidden');
        }
    });

    // --- Eventos para MODAL DE ELIMINACIÓN ---

    /**
     * Valida el input de confirmación de borrado
     */
    confirmInputDelete.addEventListener('input', () => {
        finalDeleteBtn.disabled = confirmInputDelete.value !== textoValidacionEliminar;
    });

    /**
     * Maneja el clic en el botón final de "Eliminar permanentemente"
     */
    finalDeleteBtn.addEventListener('click', () => {
        if (finalDeleteBtn.disabled || idParaEliminar === null) return;

        fetch(`${API_URL}/material/${idParaEliminar}`, {
            method: 'DELETE'
        })
        .then(respuesta => {
            if (respuesta.ok) {
                deleteModal.classList.add('hidden');
                cargarMateriales(); // Recarga la lista
                idParaEliminar = null; // Limpia el ID
            } else {
                throw new Error('No se pudo eliminar el material. Es posible que esté en uso.');
            }
        })
        .catch(e => {
            console.error('Hubo un error al eliminar:', e);
            alert(e.message);
        });
    });

    /**
     * Cierra el modal de eliminación
     */
    closeDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });

    deleteModal.addEventListener('click', (event) => {
        if (event.target === deleteModal) {
            deleteModal.classList.add('hidden');
        }
    });

}); // Fin del DOMContentLoaded