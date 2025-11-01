/**
 * ===================================================================
 * SCRIPT DE PROVEEDORES (proveedores.js)
 * * Propósito: Este archivo maneja toda la lógica específica
 * de la página de "Proveedores".
 * - Cargar la lista de proveedores desde la API.
 * - Validar el formulario de nuevo proveedor en tiempo real.
 * - Manejar los clics en "Editar" y "Eliminar".
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

    // --- Elementos del MODAL DE NUEVO/EDITAR PROVEEDOR ---
    const formularioProvedor = document.getElementById('form-nuevo-proveedor');
    const submitButton = formularioProvedor.querySelector('button[type="submit"]');
    // Inputs
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

        // --- ¡CAMBIO! Ya no se usa simulación, se usa el FETCH real ---
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

                // 2. Vacía el grid antes de llenarlo
                grid.innerHTML = '';

                if (proveedoresCargados.length > 0) {
                    // Si hay proveedores, oculta el mensaje de "vacío"
                    emptyState.classList.add('hidden');
                    gridProveedoresContainer.classList.remove('hidden');

                    const tarjetasHtml = proveedoresCargados.map(p => {
                        // Se usan CLASES (class) en lugar de ID (id) para los botones
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
     * Esta función se llama CADA VEZ que el usuario escribe algo.
     * Revisa todas las condiciones y habilita/deshabilita el botón de guardar.
     */
    function validarFormulario() {

        // 1. Obtenemos los valores actuales de los campos
        const nombreVal = nombreInput.value.trim();
        const contactoVal = contactoInput.value.trim();
        const telefonoVal = telefonoInput.value.trim();
        const emailVal = emailInput.value.trim();
        const direccionVal = direccionInput.value.trim();

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
        } else if (proveedoresCargados.some(p => p.nombre.toLowerCase() === nombreVal.toLowerCase())) {
            // ¡CONDICIÓN 1: Nombre no repetido!
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
        // ¡CONDICIÓN 2: Más de 10 dígitos y que sea número!
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
        // ¡CONDICIÓN 3: Más de 5 caracteres!
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
        // ¡CONDICIÓN 4: Formato de email válido!
        if (emailVal.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
            emailError.textContent = 'El formato del email no es válido.';
            emailError.classList.add('visible');
            emailInput.classList.add('invalid');
            esEmailValido = false;
        } else {
            // Es válido si está vacío (opcional) o si cumple el formato
            emailError.textContent = '';
            emailError.classList.remove('visible');
            emailInput.classList.remove('invalid');
            esEmailValido = true; // (Ajusta esto si el email es 100% obligatorio)
        }

        // --- HABILITACIÓN DEL BOTÓN ---
        // Comprueba que TODAS las banderas sean verdaderas.
        const esFormularioValido = esNombreValido && esContactoValido && esTelefonoValido && esEmailValido && esDireccionValida;

        // ¡CONDICIÓN 5: Habilita el botón SOLO SI todo es válido!
        submitButton.disabled = !esFormularioValido;
    }


    // --- 4. "Oyentes" de Eventos (Event Listeners) ---

    /**
     * Escucha el evento 'input' (cada vez que se teclea)
     * en CUALQUIER campo dentro del formulario.
     */
    formularioProvedor.addEventListener('input', validarFormulario);

    /**
     * Maneja el envío (submit) del formulario.
     * (Por ahora, solo previene la recarga y muestra un alert).
     */
    formularioProvedor.addEventListener('submit', (e) => {
        e.preventDefault(); // Previene la recarga de la página

        // Doble chequeo por si acaso
        if (submitButton.disabled) {
            alert('El formulario tiene errores, por favor corrígelos.');
            return;
        }

        const nuevoProveedor = {
            "nombre": nombreInput.value.trim(),
            "contacto": contactoInput.value.trim(),
            "telefono": telefonoInput.value.trim(),
            "correo": emailInput.value.trim(),
            "direccion": direccionInput.value.trim()
        }

        fetch(`${API_URL}/produccion/proveedor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevoProveedor),
        })
            .then(respuesta => {
                if (!respuesta.ok) {
                    throw new Error(`Error HTTP ${respuesta.status}`);
                }
                return respuesta.json();
            })
            .then(() => {
                nombreInput.value = '';
                contactoInput.value = '';
                telefonoInput.value = '';
                emailInput.value = '';
                direccionInput.value = '';

                grid.innerHTML = '';
                mostrarProveedores();

                modalNuevoProveedor.classList.add('hidden');
            })

    });


    /**
     * Maneja los clics en los botones "Editar" y "Eliminar"
     * usando delegación de eventos.
     */
    gridProveedoresContainer.addEventListener('click', e => {
        if (e.target.classList.contains('btn-editar')) {
            console.log('Clic en EDITAR');
            // TODO: Lógica para editar

        } else if (e.target.classList.contains('btn-eliminar')) {
            // TODO: Lógica para eliminar
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
                        confirmInputDelete.value = ''; // Limpia el input
                        finalDeleteBtn.disabled = true; // Regresa al boton desactivado

                    })
                } else {
                    finalDeleteBtn.disabled = true;
                }
            });
        }
    });
    /**
     * Lógica para el modal de ELIMINAR
     */
    closeDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
        confirmInputDelete.value = ''; // Limpia el input
    });

    deleteModal.addEventListener('click', (event) => {
        if (event.target === deleteModal) {
            deleteModal.classList.add('hidden');
            confirmInputDelete.value = ''; // Limpia el input
        }
    });

    // TODO: Añadir lógica para el botón 'finalDeleteBtn'


    // --- FUNCIÓN DE SIMULACIÓN ELIMINADA ---
    // (Ya no existe simularCargaAPI)

}); // Fin del DOMContentLoaded