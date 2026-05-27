document.addEventListener('DOMContentLoaded', () => {
    // 1. Lógica del selector de cantidad
    const qtyInput = document.getElementById('qtyInput');
    const decBtn = document.getElementById('decQtyBtn');
    const incBtn = document.getElementById('incQtyBtn');

    if (decBtn && incBtn && qtyInput) {
        decBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val > 1) qtyInput.value = val - 1;
        });
        incBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val < parseInt(qtyInput.max)) qtyInput.value = val + 1;
        });
    }

    // 2. Lógica del Modal de Especificaciones
    const specsModal = document.getElementById('specsModal');
    const openSpecsBtn = document.getElementById('openSpecsModalBtn');
    const closeSpecsBtns = document.querySelectorAll('.modal-close, .modal-close-btn');

    if (openSpecsBtn && specsModal) {
        openSpecsBtn.addEventListener('click', () => {
            specsModal.style.display = 'flex';
        });
    }

    closeSpecsBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (specsModal) specsModal.style.display = 'none';
        });
    });

    // 3. Añadir al carrito desde la vista de detalle
    const addToCartBtn = document.getElementById('addToCartBtnDetail');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const producto = JSON.parse(localStorage.getItem("productoSeleccionado"));
            if (!producto) return;
            
            // Usamos la instancia global de catalogo definida en script.js
            if (typeof catalogo !== 'undefined') {
                const cantidad = parseInt(qtyInput.value) || 1;
                // Simulamos añadir múltiples veces si la cantidad es mayor a 1
                for(let i=0; i<cantidad; i++) {
                    catalogo.agregarAlCarrito(producto.id, addToCartBtn);
                }
                addToCartBtn.innerHTML = '<i class="fas fa-check"></i> ¡AÑADIDO!';
                addToCartBtn.style.background = '#28a745';
                setTimeout(() => {
                    addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> AÑADIR AL CARRITO';
                    addToCartBtn.style.background = 'linear-gradient(45deg, var(--primary), var(--secondary))';
                }, 2000);
            }
        });
    }
});