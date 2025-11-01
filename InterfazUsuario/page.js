/**
 * ===================================================================
 * SCRIPT GLOBAL DE PÁGINA (page.js)
 * * Propósito: Este archivo maneja la navegación principal de la barra
 * lateral y la lógica para ABRIR los modales principales.
 * ===================================================================
 */

/**
 * Espera a que todo el contenido del HTML (DOM) esté cargado
 * antes de ejecutar cualquier script, para evitar errores.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // Inicia las dos funciones principales de este archivo
    setupSidebarNavigation();
    setupModalLogic();
    
});

/**
 * Configura la lógica para ABRIR los modales de "Nueva Entrada" y "Nuevo Proveedor".
 * No maneja el modal de "Eliminar", ya que ese es más específico.
 */
function setupModalLogic() {
    
    // 1. Define los botones que abren modales
    const modales = [
        { btn: 'btn-nueva-entrada', modal: 'modal-nueva-entrada', close: 'modal-close-entrada' }
        // La lógica del modal de proveedor se movió a proveedores.js
        // { btn: 'btn-nuevo-proveedor', modal: 'modal-nuevo-proveedor', close: 'modal-close-proveedor' }
    ];

    // 2. Recorre la lista y añade los "oyentes" de clics
    modales.forEach(config => {
        try {
            // Busca los elementos en el HTML
            const modalEl = document.getElementById(config.modal);
            const openBtnEl = document.getElementById(config.btn);
            const closeBtnEl = document.getElementById(config.close);

            // 3. Lógica para ABRIR (al hacer clic en el botón "+ Nuevo")
            openBtnEl.addEventListener('click', () => {
                modalEl.classList.remove('hidden');
                
                // (Opcional: Si el modal tiene un formulario, lo resetea)
                const form = modalEl.querySelector('form');
                if (form) {
                    form.reset(); 
                }
            });
            
            // 4. Lógica para CERRAR (al hacer clic en la 'X')
            closeBtnEl.addEventListener('click', () => {
                modalEl.classList.add('hidden');
            });
            
            // 5. Lógica para CERRAR (al hacer clic en el fondo oscuro)
            modalEl.addEventListener('click', (event) => {
                // Comprueba si el clic fue en el fondo (overlay) y no en el contenido
                if (event.target === modalEl) {
                    modalEl.classList.add('hidden');
                }
            });

        } catch (e) {
            // Si no encuentra un botón (ej. 'btn-nueva-entrada' en la pág. de Proveedores),
            // simplemente lo ignora en lugar de romper el script.
            console.warn(`Elemento modal no encontrado (esto es normal si no está en la página): ${config.modal}`);
        }
    });
}

/**
 * Configura la navegación de la barra lateral.
 * Muestra/oculta las secciones de la página al hacer clic en un enlace.
 */
function setupSidebarNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const pages = document.querySelectorAll('.content .page');

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            
            // Previene que el enlace `<a>` intente recargar la página
            event.preventDefault(); 
            
            // Obtiene el ID de la página a mostrar desde el atributo 'data-page'
            // (ej. 'dashboard' -> 'dashboard-page')
            const targetPageId = link.dataset.page + '-page';

            // 1. Oculta todas las páginas y quita 'active' de todos los enlaces
            navLinks.forEach(nav => nav.parentElement.classList.remove('active'));
            pages.forEach(page => page.classList.remove('active'));

            // 2. Muestra solo la página correcta y resalta el enlace correcto
            link.parentElement.classList.add('active');
            document.getElementById(targetPageId).classList.add('active');

            /**
             * NOTA DE OPTIMIZACIÓN:
             * Aquí es donde deberías llamar a las funciones para cargar datos.
             * Por ejemplo:
             * if (targetPageId === 'proveedores-page') {
             * mostrarProveedores(); // (Esta función viviría en proveedores.js)
             * }
             */
        });
    });
}