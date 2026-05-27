document.addEventListener('DOMContentLoaded', () => {
    const qtyInput = document.getElementById('qtyInput');
    const decBtn = document.getElementById('decQtyBtn');
    const incBtn = document.getElementById('incQtyBtn');

    if (decBtn && incBtn && qtyInput) {
        decBtn.addEventListener('click', () => { let val = parseInt(qtyInput.value); if (val > 1) qtyInput.value = val - 1; });
        incBtn.addEventListener('click', () => { let val = parseInt(qtyInput.value); if (val < parseInt(qtyInput.max)) qtyInput.value = val + 1; });
    }

    const addToCartBtn = document.getElementById('addToCartBtnDetail');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const producto = JSON.parse(localStorage.getItem("productoSeleccionado"));
            if (!producto || typeof catalogo === 'undefined') return;
            const cantidad = parseInt(qtyInput.value) || 1;
            for(let i=0; i<cantidad; i++) catalogo.agregarAlCarrito(producto.id, addToCartBtn);
            addToCartBtn.innerHTML = '<i class="fas fa-check"></i> ¡AÑADIDO!';
            addToCartBtn.style.background = 'var(--secondary)';
            setTimeout(() => {
                addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> AÑADIR AL CARRITO';
                addToCartBtn.style.background = 'var(--primary)';
            }, 2000);
        });
    }
});