/**
 * ===================================================================
 * SCRIPT DE PROVEEDORES (proveedores.js)
 * * Propósito: Este archivo maneja toda la lógica específica
 * de la página de "Proveedores".
 * - Cargar la lista de proveedores desde la API.
 * - Validar el formulario de nuevo proveedor en tiempo real.
 * - Manejar los clics en "Editar" y "Eliminar".
 * - Filtrar proveedores por búsqueda.
 * ===================================================================
 */

// Espera a que el HTML esté cargado
document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Constantes y Variables ---

    // URL de tu backend (cámbiala si es necesario)
    const API_URL = 'http://localhost:8080';

    // --- Almacén local de datos ---
    /** * Guarda la lista de proveedores traída de la API.
     * Es crucial para la validación de nombres duplicados.
     */
    let proveedoresCargados = [];

    // --- Elementos de la PÁGINA ---
    const emptyState = document.getElementById('proveedores-empty-state');
    const gridProveedoresContainer = document.getElementById('proveedores-grid-container');
    const grid = document.getElementById('grid-proveedores');
    const modalNuevoProveedor = document.getElementById('modal-nuevo-proveedor');
    const openModalBtn = document.getElementById('btn-nuevo-proveedor');
    const searchInput = document.getElementById('search-proveedor'); // <-- Elemento de búsqueda

    // --- Elementos del MODAL DE NUEVO/EDITAR PROVEEDOR ---
    const formularioProvedor = document.getElementById('form-nuevo-proveedor');
    const submitButton = formularioProvedor.querySelector('button[type="submit"]');
    const modalTitulo = modalNuevoProveedor.querySelector('h2');
    const closeModalBtnProveedor = document.getElementById('modal-close-proveedor');
    // Inputs
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

    // --- Elementos del MODAL DE ELIMINACIÓN ---
    const deleteModal = document.getElementById('modal-confirmar-delete');
    const closeDeleteBtn = document.getElementById('modal-close-delete');
    const confirmInputDelete = document.getElementById('delete-confirm-input');
    const finalDeleteBtn = document.getElementById('btn-final-delete');

    // --- 2. Carga Inicial de Datos ---

    // Llama a la función para cargar la lista de proveedores
    // en cuanto la página esté lista.
    mostrarProveedores();


    // --- 3. Funciones Principales ---

    /**
     * Busca los proveedores en la API y los "pinta" en el grid HTML.
     * También guarda la lista de proveedores en 'proveedoresCargados'.
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
                // 1. Guardamos la lista de proveedores en nuestra variable local.
                proveedoresCargados = proveedores || [];

                // 2. Resetea los mensajes de "vacío" al estado original
                emptyState.querySelector('h3').textContent = 'No hay proveedores registrados';
                emptyState.querySelector('p').textContent = 'Añade un nuevo proveedor para empezar.';

                // 3. Vacía el grid antes de llenarlo
                grid.innerHTML = '';

                if (proveedoresCargados.length > 0) {
                    // Si hay proveedores, oculta el mensaje de "vacío"
                    emptyState.classList.add('hidden');
                    gridProveedoresContainer.classList.remove('hidden');

                    const tarjetasHtml = proveedoresCargados.map(p => {
                        return `
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
                        `;
                    }).join('');

                    grid.innerHTML = tarjetasHtml;

                } else {
                    // Si no hay proveedores, muestra el mensaje de "vacío"
                    emptyState.classList.remove('hidden');
                    gridProveedoresContainer.classList.add('hidden');
                }
            })
            .catch(e => {
                console.error("Hubo un error al cargar los proveedores:", e);
                proveedoresCargados = []; // Resetea en caso de error
                grid.innerHTML = `<p style="color: red;">Error al cargar proveedores: ${e.message}</p>`;
            });
    }

    /**
     * --- FUNCIÓN DE VALIDACIÓN (Muestra los mensajes de error) ---
     */
    function validarFormulario() {

        // 1. Obtenemos los valores actuales de los campos
        const nombreVal = nombreInput.value.trim();
        const contactoVal = contactoInput.value.trim();
        const telefonoVal = telefonoInput.value.trim();
        const emailVal = emailInput.value.trim();
        const direccionVal = direccionInput.value.trim();
        const idActual = idInput.value; // Obtiene el ID (estará vacío si es "Nuevo")


        // 2. Banderas de validación. Empezamos asumiendo que todo es válido.
        let esNombreValido = true;
        let esContactoValido = true;
        let esTelefonoValido = true;
        let esEmailValido = true;
        let esDireccionValida = true;

        // --- VALIDACIÓN DE NOMBRE ---
        if (nombreVal.length === 0) {
            nombreError.textContent = 'El nombre es obligatorio.';
            nombreError.classList.add('visible');
            nombreInput.classList.add('invalid');
            esNombreValido = false;
        } else if (proveedoresCargados.some(
            // La condición ahora es: (Mismo nombre) Y (Diferente ID)
            p => p.nombre.toLowerCase() === nombreVal.toLowerCase() && p.id != idActual
        )) {
            nombreError.textContent = 'Este proveedor ya existe.';
            nombreError.classList.add('visible');
            nombreInput.classList.add('invalid');
            esNombreValido = false;
        } else {
            nombreError.textContent = '';
            nombreError.classList.remove('visible');
            nombreInput.classList.remove('invalid');
        }

        // --- VALIDACIÓN DE CONTACTO (Obligatorio) ---
        if (contactoVal.length === 0) {
            contactoError.textContent = 'El contacto es obligatorio.';
            contactoError.classList.add('visible');
            contactoInput.classList.add('invalid');
            esContactoValido = false;
        } else {
            contactoError.textContent = '';
            contactoError.classList.remove('visible');
            contactoInput.classList.remove('invalid');
        }

        // --- VALIDACIÓN DE TELÉFONO ---
        if (telefonoVal.length <= 9 || isNaN(telefonoVal)) {
            telefonoError.textContent = 'Debe ser un número de más de 10 dígitos.';
            telefonoError.classList.add('visible');
            telefonoInput.classList.add('invalid');
            esTelefonoValido = false;
        } else {
            telefonoError.textContent = '';
            telefonoError.classList.remove('visible');
            telefonoInput.classList.remove('invalid');
        }

        // --- VALIDACIÓN DE DIRECCIÓN ---
        if (direccionVal.length <= 5) {
            direccionError.textContent = 'Debe tener más de 5 caracteres.';
            direccionError.classList.add('visible');
            direccionInput.classList.add('invalid');
            esDireccionValida = false;
        } else {
            direccionError.textContent = '';
            direccionError.classList.remove('visible');
            direccionInput.classList.remove('invalid');
        }

        // --- VALIDACIÓN DE EMAIL ---
        if (emailVal.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
            emailError.textContent = 'El formato del email no es válido.';
            emailError.classList.add('visible');
            emailInput.classList.add('invalid');
            esEmailValido = false;
        } else {
            emailError.textContent = '';
            emailError.classList.remove('visible');
            emailInput.classList.remove('invalid');
            esEmailValido = true;
        }

        // --- HABILITACIÓN DEL BOTÓN ---
        const esFormularioValido = esNombreValido && esContactoValido && esTelefonoValido && esEmailValido && esDireccionValida;
        submitButton.disabled = !esFormularioValido;
    }


    // --- 4. "Oyentes" de Eventos (Event Listeners) ---

    // Función para limpiar errores visuales
    function limpiarErroresFormulario() {
        formularioProvedor.querySelectorAll('.validation-message').forEach(el => el.classList.remove('visible'));
        formularioProvedor.querySelectorAll('.form-group input').forEach(el => el.classList.remove('invalid'));
    }

    // Al hacer clic en "+ Nuevo Proveedor"
    openModalBtn.addEventListener('click', () => {
        idInput.value = ''; 
        modalTitulo.textContent = 'Registrar Nuevo Proveedor';
        formularioProvedor.reset(); 
        limpiarErroresFormulario();
        submitButton.disabled = true; 
        modalNuevoProveedor.classList.remove('hidden');
    });

    // Al cerrar con la 'X'
    closeModalBtnProveedor.addEventListener('click', () => {
        modalNuevoProveedor.classList.add('hidden');
    });

    // Al cerrar haciendo clic fuera
    modalNuevoProveedor.addEventListener('click', (event) => {
        if (event.target === modalNuevoProveedor) {
            modalNuevoProveedor.classList.add('hidden');
        }
    });

    /**
     * Escucha el evento 'input' (cada vez que se teclea)
     * en CUALQUIER campo dentro del formulario.
     */
    formularioProvedor.addEventListener('input', validarFormulario);

    /**
     * Maneja el envío (submit) del formulario.
     * Decide si crear (POST) o actualizar (PUT).
     */
    formularioProvedor.addEventListener('submit', (e) => {
        e.preventDefault(); 
        if (submitButton.disabled) return;

        const idActual = idInput.value;
        const esModoEdicion = idActual !== '';

        const datosProveedor = {
            "nombre": nombreInput.value.trim(),
            "contacto": contactoInput.value.trim(),
            "telefono": telefonoInput.value.trim(),
            "correo": emailInput.value.trim(),
            "direccion": direccionInput.value.trim()
        };

        const url = esModoEdicion
            ? `${API_URL}/produccion/proveedor/${idActual}` // URL para PUT (Editar)
            : `${API_URL}/produccion/proveedor`;           // URL para POST (Nuevo)

        const method = esModoEdicion ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosProveedor),
        })
        .then(respuesta => {
            if (!respuesta.ok) {
                throw new Error(`Error HTTP ${respuesta.status}`);
            }
            return respuesta.json().catch(() => null); 
        })
        .then(() => {
            modalNuevoProveedor.classList.add('hidden'); 
            mostrarProveedores(); // Recarga la lista de proveedores
        })
        .catch(error => {
            console.error('Error al guardar proveedor:', error);
            alert('Hubo un error al guardar. Revisa la consola.');
        });
    });


    /**
     * Maneja los clics en los botones "Editar" y "Eliminar"
     * usando delegación de eventos.
     */
    gridProveedoresContainer.addEventListener('click', e => {
        if (e.target.classList.contains('btn-editar')) {
            // --- INICIA LÓGICA DE EDITAR ---
            
            const card = e.target.closest('.proveedor-card');
            const idProveedor = card.dataset.idproveedor;

            const proveedor = proveedoresCargados.find(p => p.id == idProveedor);

            if (!proveedor) {
                alert('Error: No se encontró el proveedor.');
                return;
            }

            idInput.value = proveedor.id; 
            nombreInput.value = proveedor.nombre;
            contactoInput.value = proveedor.contacto;
            telefonoInput.value = proveedor.telefono;
            emailInput.value = proveedor.correo;
            direccionInput.value = proveedor.direccion;

            modalTitulo.textContent = 'Editar Proveedor';
            limpiarErroresFormulario();
            submitButton.disabled = false; 
            modalNuevoProveedor.classList.remove('hidden');
            
            // --- FIN LÓGICA DE EDITAR ---

        } else if (e.target.classList.contains('btn-eliminar')) {
            // --- INICIA LÓGICA DE ELIMINAR ---
            nombreProveedor = e.target.parentElement.parentElement.querySelector('h3').textContent;
            id = parseInt(e.target.parentElement.parentElement.parentElement.getAttribute('data-idproveedor'));
            confirmInputDelete.parentElement.parentElement.querySelector('#delete-provider-name').textContent = nombreProveedor;
            deleteModal.classList.remove('hidden');
            validacion = `eliminar-${nombreProveedor.replace(/\s+/g, '-').toLowerCase()}`;
            confirmInputDelete.parentElement.parentElement.querySelector('.eliminar-input-validacion').textContent = validacion;
            confirmInputDelete.addEventListener('input', e => {
                if (e.target.value === validacion) {
                    finalDeleteBtn.disabled = false;
                    finalDeleteBtn.addEventListener('click', () => {

                        fetch(`${API_URL}/produccion/proveedor/${id}`, {
                            method: 'DELETE'
                        })
                            .then(respuesta => {
                                if (respuesta.ok) {
                                    console.log('se borro correctamente al proveedor');
                                } else {
                                    alert('hubo problemas al borrar el proveedor');
                                }
                            })
                            .catch(e => console.log('hubo un error: ' + e))

                        location.reload();

                        deleteModal.classList.add('hidden');
                        confirmInputDelete.value = ''; 
                        finalDeleteBtn.disabled = true; 

                    })
                } else {
                    finalDeleteBtn.disabled = true;
                }
            });
            // --- FIN LÓGICA DE ELIMINAR ---
        }
    });

    /**
     * Lógica para el modal de ELIMINAR
     */
    closeDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
        confirmInputDelete.value = ''; 
    });

    deleteModal.addEventListener('click', (event) => {
        if (event.target === deleteModal) {
            deleteModal.classList.add('hidden');
            confirmInputDelete.value = ''; 
        }
    });


    // --- 5. LÓGICA DE BÚSQUEDA ---
    searchInput.addEventListener('input', (e) => {
        const terminoBusqueda = e.target.value.trim().toLowerCase();
        
        // Obtiene todas las tarjetas (las que están en el DOM)
        const todasLasTarjetas = grid.querySelectorAll('.proveedor-card');
        let hayResultados = false;

        todasLasTarjetas.forEach(tarjeta => {
            // Busca en el nombre, contacto, teléfono y correo
            const nombre = tarjeta.querySelector('h3').textContent.toLowerCase();
            const contacto = tarjeta.querySelector('.proveedorContacto').textContent.toLowerCase();
            const telefono = tarjeta.querySelector('.proveedorTelefono').textContent.toLowerCase();
            const correo = tarjeta.querySelector('.proveedorCorreo').textContent.toLowerCase();

            // Comprueba si el término de búsqueda está en CUALQUIERA de los campos
            const coincide = nombre.includes(terminoBusqueda) ||
                           contacto.includes(terminoBusqueda) ||
                           telefono.includes(terminoBusqueda) ||
                           correo.includes(terminoBusqueda);

            if (coincide) {
                tarjeta.style.display = ''; // Muestra la tarjeta
                hayResultados = true;
            } else {
                tarjeta.style.display = 'none'; // Oculta la tarjeta
            }
        });

        // Manejo del estado "sin resultados"
        // Si no hay resultados Y hay proveedores cargados, muestra un mensaje de "no resultados"
        if (!hayResultados && proveedoresCargados.length > 0) {
            emptyState.querySelector('h3').textContent = 'No se encontraron proveedores';
            emptyState.querySelector('p').textContent = 'Intenta con un término de búsqueda diferente.';
            emptyState.classList.remove('hidden');
            gridProveedoresContainer.classList.add('hidden');
        } 
        // Si hay resultados, oculta el mensaje de "vacío"
        else if (hayResultados) {
            emptyState.classList.add('hidden');
            gridProveedoresContainer.classList.remove('hidden');
        }
        // Si no hay resultados Y NO hay proveedores cargados, muestra el mensaje original
        else if (!hayResultados && proveedoresCargados.length === 0) {
            emptyState.querySelector('h3').textContent = 'No hay proveedores registrados';
            emptyState.querySelector('p').textContent = 'Añade un nuevo proveedor para empezar.';
            emptyState.classList.remove('hidden');
            gridProveedoresContainer.classList.add('hidden');
        }
    });


}); // Fin del DOMContentLoaded