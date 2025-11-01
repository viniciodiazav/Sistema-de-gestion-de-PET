/**
 * ===================================================================
 * SCRIPT DE PROVEEDORES (proveedores.js)
 * * Maneja toda la lógica de la página de Proveedores:
 * - Cargar, Crear, Editar, Borrar (CRUD)
 * - Validación de formulario
 * - Búsqueda (filtro)
 * ===================================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Constantes y Variables ---
    const API_URL = 'http://localhost:8080';
    let proveedoresCargados = []; // Caché local de proveedores

    // --- Elementos de la PÁGINA ---
    const emptyState = document.getElementById('proveedores-empty-state');
    const gridProveedoresContainer = document.getElementById('proveedores-grid-container');
    const grid = document.getElementById('grid-proveedores');
    const searchInput = document.getElementById('search-proveedor');
    const openModalBtn = document.getElementById('btn-nuevo-proveedor');

    // --- Elementos del MODAL de Nuevo/Editar ---
    const modalNuevoProveedor = document.getElementById('modal-nuevo-proveedor');
    const formularioProvedor = document.getElementById('form-nuevo-proveedor');
    const submitButton = formularioProvedor.querySelector('button[type="submit"]');
    const modalTitulo = modalNuevoProveedor.querySelector('h2');
    const closeModalBtnProveedor = document.getElementById('modal-close-proveedor');
    const idInput = document.getElementById('prov-id');
    const nombreInput = document.getElementById('prov-nombre');
    const contactoInput = document.getElementById('prov-contacto');
    const telefonoInput = document.getElementById('prov-telefono');
    const emailInput = document.getElementById('prov-email');
    const direccionInput = document.getElementById('prov-direccion');
    // Mensajes de error
    const nombreError = document.getElementById('error-prov-nombre');
    const contactoError = document.getElementById('error-prov-contacto');
    const telefonoError = document.getElementById('error-prov-telefono');
    const emailError = document.getElementById('error-prov-email');
    const direccionError = document.getElementById('error-prov-direccion');

    // --- Elementos del MODAL de Eliminación ---
    const deleteModal = document.getElementById('modal-confirmar-delete');
    const closeDeleteBtn = document.getElementById('modal-close-delete');
    const confirmInputDelete = document.getElementById('delete-confirm-input');
    const finalDeleteBtn = document.getElementById('btn-final-delete');
    const deleteProviderNameSpan = document.getElementById('delete-provider-name');
    const deleteValidationTextSpan = document.querySelector('.eliminar-input-validacion');
    
    // Variables globales para el modal de borrado
    let idParaEliminar = null;
    let validacionParaEliminar = '';

    // --- 2. Carga Inicial de Datos ---
    mostrarProveedores();

    // --- 3. Funciones Principales ---

    /**
     * Busca los proveedores en la API (GET) y los muestra en el grid.
     */
    function mostrarProveedores() {
        grid.innerHTML = '<p>Cargando proveedores...</p>'; 

        fetch(`${API_URL}/produccion/proveedores`)
            .then(respuesta => {
                if (!respuesta.ok) {
                    throw new Error(`Error HTTP ${respuesta.status}`);
                }
                return respuesta.json();
            })
            .then(proveedores => {
                proveedoresCargados = proveedores || []; // Almacena en caché
                grid.innerHTML = ''; // Limpia el "Cargando..."
                
                // Restaura el mensaje de "vacío" por si estaba en modo búsqueda
                emptyState.querySelector('h3').textContent = 'No hay proveedores registrados';
                emptyState.querySelector('p').textContent = 'Añade un nuevo proveedor para empezar.';

                if (proveedoresCargados.length > 0) {
                    emptyState.classList.add('hidden');
                    gridProveedoresContainer.classList.remove('hidden');

                    const tarjetasHtml = proveedoresCargados.map(p => `
                        <div class="proveedor-card" data-idproveedor="${p.id}">
                            <div class="proveedor-card-header">
                                <h3>${p.nombre}</h3>
                                <div class="proveedor-card-actions">
                                    <i class="fas fa-edit btn-editar" title="Editar"></i>
                                    <i class="fas fa-trash btn-eliminar" title="Borrar"></i>
                                </div>
                            </div>
                            <div class="proveedor-card-body">
                                <div class="proveedor-info-line">
                                    <i class="fas fa-user fa-fw"></i>
                                    <span class="proveedorContacto">${p.contacto}</span>
                                </div>
                                <div class="proveedor-info-line">
                                    <i class="fas fa-phone fa-fw"></i>
                                    <span class="proveedorTelefono">${p.telefono}</span>
                                </div>
                                <div class="proveedor-info-line">
                                    <i class="fas fa-envelope fa-fw"></i>
                                    <span class="proveedorCorreo">${p.correo || 'N/A'}</span>
                                </div>
                                <div class="proveedor-info-line">
                                    <i class="fas fa-location-dot fa-solid"></i>
                                    <span class="proveedorDireccion">${p.direccion || 'N/A'}</span>
                                </div>                        
                            </div> 
                        </div>
                    `).join('');
                    grid.innerHTML = tarjetasHtml;
                } else {
                    // Muestra el estado vacío si no hay proveedores
                    emptyState.classList.remove('hidden');
                    gridProveedoresContainer.classList.add('hidden');
                }
            })
            .catch(e => {
                console.error("Hubo un error al cargar los proveedores:", e);
                proveedoresCargados = [];
                grid.innerHTML = `<p style="color: red;">Error al cargar proveedores: ${e.message}. Asegúrate que el servidor (backend) esté encendido.</p>`;
            });
    }

    /**
     * Valida el formulario de proveedor en tiempo real.
     */
    function validarFormulario() {
        const nombreVal = nombreInput.value.trim();
        const contactoVal = contactoInput.value.trim();
        const telefonoVal = telefonoInput.value.trim();
        const emailVal = emailInput.value.trim();
        const direccionVal = direccionInput.value.trim();
        const idActual = idInput.value; // Vacío si es "Nuevo", con ID si es "Editar"

        let esNombreValido = true;
        let esContactoValido = true;
        let esTelefonoValido = true;
        let esEmailValido = true;
        let esDireccionValida = true;

        // --- Validación de Nombre (Obligatorio y no duplicado) ---
        if (nombreVal.length === 0) {
            nombreError.textContent = 'El nombre es obligatorio.';
            esNombreValido = false;
        } else if (proveedoresCargados.some(
            // El nombre existe Y NO es el del proveedor que estamos editando
            p => p.nombre.toLowerCase() === nombreVal.toLowerCase() && p.id != idActual
        )) {
            nombreError.textContent = 'Este proveedor ya existe.';
            esNombreValido = false;
        }
        nombreError.classList.toggle('visible', !esNombreValido);
        nombreInput.classList.toggle('invalid', !esNombreValido);

        // --- Validación de Contacto (Obligatorio) ---
        if (contactoVal.length === 0) {
            contactoError.textContent = 'El contacto es obligatorio.';
            esContactoValido = false;
        }
        contactoError.classList.toggle('visible', !esContactoValido);
        contactoInput.classList.toggle('invalid', !esContactoValido);

        // --- Validación de Teléfono (Al menos 10 dígitos numéricos) ---
        if (telefonoVal.length < 10 || isNaN(telefonoVal)) {
            telefonoError.textContent = 'Debe ser un número de al menos 10 dígitos.';
            esTelefonoValido = false;
        }
        telefonoError.classList.toggle('visible', !esTelefonoValido);
        telefonoInput.classList.toggle('invalid', !esTelefonoValido);

        // --- Validación de Dirección (Al menos 5 caracteres) ---
        if (direccionVal.length <= 5) {
            direccionError.textContent = 'Debe tener más de 5 caracteres.';
            esDireccionValida = false;
        }
        direccionError.classList.toggle('visible', !esDireccionValida);
        direccionInput.classList.toggle('invalid', !esDireccionValida);

        // --- Validación de Email (Formato válido si se ingresa) ---
        if (emailVal.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
            emailError.textContent = 'El formato del email no es válido.';
            esEmailValido = false;
        }
        emailError.classList.toggle('visible', !esEmailValido);
        emailInput.classList.toggle('invalid', !esEmailValido);

        // --- Habilitación del Botón ---
        const esFormularioValido = esNombreValido && esContactoValido && esTelefonoValido && esEmailValido && esDireccionValida;
        submitButton.disabled = !esFormularioValido;
    }

    /**
     * Limpia los mensajes de error y bordes rojos del formulario.
     */
    function limpiarErroresFormulario() {
        formularioProvedor.querySelectorAll('.validation-message').forEach(el => el.classList.remove('visible'));
        formularioProvedor.querySelectorAll('.form-group input').forEach(el => el.classList.remove('invalid'));
    }

    // --- 4. Asignación de Eventos (Event Listeners) ---

    // === A. Modal de Proveedor (Apertura/Cierre) ===
    
    openModalBtn.addEventListener('click', () => {
        // Configura el modal para "Modo Nuevo"
        idInput.value = ''; // Limpia el ID oculto
        modalTitulo.textContent = 'Registrar Nuevo Proveedor';
        formularioProvedor.reset(); 
        limpiarErroresFormulario();
        submitButton.disabled = true; // Deshabilita hasta validar
        modalNuevoProveedor.classList.remove('hidden');
    });

    closeModalBtnProveedor.addEventListener('click', () => {
        modalNuevoProveedor.classList.add('hidden');
    });

    modalNuevoProveedor.addEventListener('click', (event) => {
        if (event.target === modalNuevoProveedor) {
            modalNuevoProveedor.classList.add('hidden');
        }
    });

    // === B. Formulario de Proveedor (Validación y Envío) ===
    
    // Valida en tiempo real mientras el usuario escribe
    formularioProvedor.addEventListener('input', validarFormulario);

    // Maneja el envío del formulario (POST o PUT)
    formularioProvedor.addEventListener('submit', (e) => {
        e.preventDefault(); 
        if (submitButton.disabled) return; 

        const idActual = idInput.value;
        const esModoEdicion = idActual !== '';
        
        // Objeto de datos a enviar (DTO)
        const datosProveedor = {
            "nombre": nombreInput.value.trim(),
            "contacto": contactoInput.value.trim(),
            "telefono": telefonoInput.value.trim(),
            "correo": emailInput.value.trim(),
            "direccion": direccionInput.value.trim()
        };

        // Decide la URL y el método
        const url = esModoEdicion
            ? `${API_URL}/produccion/proveedor/${idActual}` // Actualizar (PUT)
            : `${API_URL}/produccion/proveedor`;           // Crear (POST)
        const method = esModoEdicion ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosProveedor),
        })
        .then(async respuesta => {
            if (!respuesta.ok) {
                // Si la respuesta no es OK, intenta leer el error del backend
                const errorData = await respuesta.json().catch(() => null);
                let mensajeError = `Error HTTP ${respuesta.status}`;
                if (errorData && errorData.message) {
                    // Error de validación de Spring Boot
                    if (errorData.errors) {
                        mensajeError = errorData.errors.map(err => err.defaultMessage).join(', ');
                    } else if (errorData.message.includes("constraint violation")) {
                        mensajeError = "Error: El nombre o correo ya existe.";
                    } else {
                        mensajeError = errorData.message;
                    }
                }
                throw new Error(mensajeError);
            }
            return respuesta.json().catch(() => null); // POST retorna JSON, PUT puede no retornar nada
        })
        .then(() => {
            modalNuevoProveedor.classList.add('hidden'); 
            mostrarProveedores(); // Recarga la lista
        })
        .catch(error => {
            console.error('Error al guardar proveedor:', error.message);
            alert(`Error: ${error.message}`);
        });
    });

    // === C. Acciones del Grid (Editar y Eliminar) ===
    
    // Usa delegación de eventos en el contenedor del grid
    gridProveedoresContainer.addEventListener('click', e => {
        
        // Clic en "Editar"
        if (e.target.classList.contains('btn-editar')) {
            const card = e.target.closest('.proveedor-card');
            const idProveedor = card.dataset.idproveedor;
            const proveedor = proveedoresCargados.find(p => p.id == idProveedor);

            if (!proveedor) {
                alert('Error: No se encontró el proveedor.');
                return;
            }

            // Rellena el formulario con los datos del proveedor
            idInput.value = proveedor.id; 
            nombreInput.value = proveedor.nombre;
            contactoInput.value = proveedor.contacto;
            telefonoInput.value = proveedor.telefono;
            emailInput.value = proveedor.correo;
            direccionInput.value = proveedor.direccion;

            // Configura el modal para "Modo Editar"
            modalTitulo.textContent = 'Editar Proveedor';
            limpiarErroresFormulario();
            submitButton.disabled = false; // Habilita el botón (los datos son válidos)
            modalNuevoProveedor.classList.remove('hidden');
        } 
        
        // Clic en "Eliminar"
        else if (e.target.classList.contains('btn-eliminar')) {
            const card = e.target.closest('.proveedor-card');
            const nombreProveedor = card.querySelector('h3').textContent;
            
            // Guarda las variables para el modal de confirmación
            idParaEliminar = parseInt(card.dataset.idproveedor);
            validacionParaEliminar = `eliminar-${nombreProveedor.replace(/\s+/g, '-').toLowerCase()}`;

            // Prepara y muestra el modal de confirmación
            deleteProviderNameSpan.textContent = nombreProveedor;
            deleteValidationTextSpan.textContent = validacionParaEliminar;
            confirmInputDelete.value = '';
            finalDeleteBtn.disabled = true;
            deleteModal.classList.remove('hidden');
        }
    });

    // === D. Modal de Eliminación (Eventos definidos una sola vez) ===
    
    // Valida la confirmación de borrado en tiempo real
    confirmInputDelete.addEventListener('input', () => {
        finalDeleteBtn.disabled = confirmInputDelete.value !== validacionParaEliminar;
    });

    // Maneja el clic en el botón final de "Eliminar permanentemente"
    finalDeleteBtn.addEventListener('click', () => {
        if (finalDeleteBtn.disabled || idParaEliminar === null) return;

        fetch(`${API_URL}/produccion/proveedor/${idParaEliminar}`, {
            method: 'DELETE'
        })
        .then(respuesta => {
            if (respuesta.ok) {
                deleteModal.classList.add('hidden');
                mostrarProveedores(); // Recarga la lista
            } else {
                throw new Error('No se pudo eliminar el proveedor');
            }
        })
        .catch(e => {
            console.error('Hubo un error al eliminar:', e);
            alert(e.message);
        });
    });

    closeDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });

    deleteModal.addEventListener('click', (event) => {
        if (event.target === deleteModal) {
            deleteModal.classList.add('hidden');
        }
    });

    // === E. Búsqueda (Filtro) ===
    
    searchInput.addEventListener('input', (e) => {
        const terminoBusqueda = e.target.value.trim().toLowerCase();
        const todasLasTarjetas = grid.querySelectorAll('.proveedor-card');
        let hayResultados = false;

        todasLasTarjetas.forEach(tarjeta => {
            // Lee todos los campos de texto de la tarjeta
            const nombre = tarjeta.querySelector('h3').textContent.toLowerCase();
            const contacto = tarjeta.querySelector('.proveedorContacto').textContent.toLowerCase();
            const telefono = tarjeta.querySelector('.proveedorTelefono').textContent.toLowerCase();
            const correo = tarjeta.querySelector('.proveedorCorreo').textContent.toLowerCase();

            // Comprueba si algún campo incluye el término de búsqueda
            const coincide = nombre.includes(terminoBusqueda) ||
                           contacto.includes(terminoBusqueda) ||
                           telefono.includes(terminoBusqueda) ||
                           correo.includes(terminoBusqueda);

            tarjeta.style.display = coincide ? '' : 'none'; // Muestra u oculta
            if (coincide) hayResultados = true;
        });

        // Muestra u oculta el mensaje de "estado vacío"
        const mostrarVacio = !hayResultados;
        emptyState.classList.toggle('hidden', !mostrarVacio);
        gridProveedoresContainer.classList.toggle('hidden', mostrarVacio);

        // Actualiza el texto del estado vacío según el contexto
        if (mostrarVacio) {
            if (proveedoresCargados.length > 0) {
                // Hay proveedores, pero la búsqueda no arrojó resultados
                emptyState.querySelector('h3').textContent = 'No se encontraron proveedores';
                emptyState.querySelector('p').textContent = 'Intenta con un término de búsqueda diferente.';
            } else {
                // No hay proveedores en absoluto
                emptyState.querySelector('h3').textContent = 'No hay proveedores registrados';
                emptyState.querySelector('p').textContent = 'Añade un nuevo proveedor para empezar.';
            }
        }
    });

}); // Fin del DOMContentLoaded