// ============================================
// CONFIGURACIÓN DE API
// ============================================
const API_URL = 'http://localhost:3000/api';

// ============================================
// CLASE PRINCIPAL DEL CATÁLOGO
// ============================================
class CatalogoAimeos {
    constructor() {
        this.productos = [];
        this.productosFiltrados = [];
        this.productosPaginados = [];
        this.totalProductos = 0;
        this.cart = [];
        this.galeriaActual = null;
        this.token = localStorage.getItem('nexusToken');
        this.filtrosActuales = {
            search: '',
            category: 'all',
            price_min: 0,
            price_max: 1000,
            page: 1,
            limit: 12
        };
        this.init();
    }

    async init() {
        this.configurarEventos();
        await this.cargarProductos();
        await this.cargarCarrito();
        this.simularCarga();
    }

    // ============================================
    // SIMULACIÓN DE CARGA INICIAL
    // ============================================
    simularCarga() {
        const bar = document.getElementById('bar');
        if (!bar) return;

        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            bar.style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(interval);
                const loading = document.getElementById('loading');
                if (loading) loading.style.display = 'none';
            }
        }, 100);
    }

    // ============================================
    // CARGAR PRODUCTOS DESDE LA API
    // ============================================
    async cargarProductos() {
        try {
            const params = new URLSearchParams({
                search: this.filtrosActuales.search,
                categoria: this.filtrosActuales.category,
                precio_min: this.filtrosActuales.price_min,
                precio_max: this.filtrosActuales.price_max,
                page: this.filtrosActuales.page,
                limit: this.filtrosActuales.limit
            });

            const response = await fetch(`${API_URL}/productos?${params}`);

            if (!response.ok) {
                throw new Error('Error al cargar productos');
            }

            const data = await response.json();

            this.productos = data.productos;
            this.productosFiltrados = data.productos;
            this.productosPaginados = data.productos;
            this.totalProductos = data.total;

            this.renderizarProductos();
            this.renderizarPaginacion();

        } catch (error) {
            console.error('Error cargando productos:', error);
            // Fallback a datos mock si la API no está disponible
            this.productos = this.obtenerProductosMock();
            this.productosFiltrados = this.productos;
            this.productosPaginados = this.productos;
            this.totalProductos = this.productos.length;
            this.renderizarProductos();
            this.renderizarPaginacion();
        }
    }

    // ============================================
    // CARGAR CARRITO DESDE LA API
    // ============================================
    async cargarCarrito() {
        if (!this.token) {
            this.actualizarContadorCarrito();
            return;
        }

        try {
            const response = await fetch(`${API_URL}/carrito`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const items = await response.json();
                this.cart = items;
                this.actualizarContadorCarrito();
            }
        } catch (error) {
            console.error('Error al cargar carrito:', error);
            this.cart = JSON.parse(localStorage.getItem('nexusCart')) || [];
            this.actualizarContadorCarrito();
        }
    }

    // ============================================
    // DATOS MOCK (FALLBACK)
    // ============================================
    obtenerProductosMock() {
        return [
            {
                id: 1,
                nombre: "Audífonos Nexus Pro",
                precio: 299,
                categoria: "audio",
                icono: "fa-headphones",
                stock: 10,
                descripcion: "Audífonos de alta fidelidad con cancelación de ruido activa, drivers de 50mm y sonido envolvente. Perfectos para gaming, música y trabajo profesional."
            },
            {
                id: 2,
                nombre: "Teclado Mecánico Neón",
                precio: 150,
                categoria: "perifericos",
                icono: "fa-keyboard",
                stock: 15,
                descripcion: "Teclado mecánico con switches de alta precisión, iluminación RGB personalizable y diseño compacto. Ideal para gamers y setups minimalistas."
            },
            {
                id: 3,
                nombre: "Monitor Ultraancho 34\"",
                precio: 899,
                categoria: "visual",
                icono: "fa-desktop",
                stock: 5,
                descripcion: "Monitor curvo ultraancho de 34 pulgadas con resolución WQHD, tasa de refresco de 144Hz y colores vibrantes. Perfecto para multitarea y gaming inmersivo."
            },
            {
                id: 4,
                nombre: "Ratón Cuántico RGB",
                precio: 89,
                categoria: "perifericos",
                icono: "fa-mouse",
                stock: 20,
                descripcion: "Mouse gaming con sensor de alta precisión de 16000 DPI, iluminación RGB y diseño ergonómico. Respuesta ultra rápida para jugadores competitivos."
            },
            {
                id: 5,
                nombre: "Micrófono Estudio XLR",
                precio: 210,
                categoria: "audio",
                icono: "fa-microphone",
                stock: 8,
                descripcion: "Micrófono profesional tipo condensador con conexión XLR, ideal para streaming, podcast y grabación de estudio con calidad de audio superior."
            },
            {
                id: 6,
                nombre: "Gafas VR Immersive",
                precio: 550,
                categoria: "visual",
                icono: "fa-vr-cardboard",
                stock: 3,
                descripcion: "Gafas de realidad virtual con seguimiento de movimiento avanzado, pantallas de alta resolución y experiencia totalmente inmersiva."
            },
            {
                id: 7,
                nombre: "Auriculares Inalámbricos",
                precio: 180,
                categoria: "audio",
                icono: "fa-headphones",
                stock: 12,
                descripcion: "Auriculares Bluetooth 5.0 con batería de larga duración, sonido envolvente y diseño ligero para uso diario sin cables."
            },
            {
                id: 8,
                nombre: "Mousepad Extendido",
                precio: 45,
                categoria: "perifericos",
                icono: "fa-mouse-pointer",
                stock: 25,
                descripcion: "Mousepad de gran tamaño (900x400mm) con superficie optimizada para precisión y base antideslizante. Ideal para setups gaming completos."
            }
        ];
    }

    // ============================================
    // RENDERIZAR PRODUCTOS
    // ============================================
    renderizarProductos() {
        const container = document.getElementById('catalog');
        if (!container) return;

        if (!this.productosPaginados || this.productosPaginados.length === 0) {
            container.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px;">No se encontraron productos</p>';
            return;
        }

        container.innerHTML = this.productosPaginados.map(p => `
            <article class="product-card">
                <div class="product-img" onclick="catalogo.abrirGaleria(${p.id})" style="cursor: pointer;">
                    <i class="fas ${p.icono || 'fa-box'}"></i>
                    <div class="gallery-overlay">
                        <i class="fas fa-images"></i> Ver galería
                    </div>
                </div>
                <h3>${this.escapeHtml(p.nombre)}</h3>
                <p style="color: var(--primary); font-weight: bold; margin: 10px 0;">
                    $${p.precio}
                </p>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-buy" onclick="catalogo.agregarAlCarrito(${p.id}, this)" style="flex: 2;">
                        ${this.token ? 'AÑADIR' : 'INICIAR SESIÓN'}
                    </button>
                    <button class="btn-gallery" onclick="catalogo.verProducto(${p.id})" style="flex: 1; background: #4a4a5e;">
                        👁️
                    </button>
                </div>
            </article>
        `).join('');
    }

    // ============================================
    // RENDERIZAR PAGINACIÓN
    // ============================================
    renderizarPaginacion() {
        const container = document.getElementById('paginacion');
        if (!container) return;

        const totalPages = Math.ceil(this.totalProductos / this.filtrosActuales.limit);

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '<div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">';

        // Botón anterior
        if (this.filtrosActuales.page > 1) {
            html += `<button onclick="catalogo.irPagina(${this.filtrosActuales.page - 1})">← Anterior</button>`;
        }

        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.filtrosActuales.page - 2 && i <= this.filtrosActuales.page + 2)) {
                html += `
                    <button onclick="catalogo.irPagina(${i})" 
                            style="background: ${i === this.filtrosActuales.page ? 'var(--primary)' : 'white'};
                                   color: ${i === this.filtrosActuales.page ? 'white' : 'var(--text-dark)'};
                                   border-color: ${i === this.filtrosActuales.page ? 'var(--primary)' : 'var(--border-light)'};">
                        ${i}
                    </button>
                `;
            } else if (i === this.filtrosActuales.page - 3 || i === this.filtrosActuales.page + 3) {
                html += `<span style="padding: 8px 12px;">...</span>`;
            }
        }

        // Botón siguiente
        if (this.filtrosActuales.page < totalPages) {
            html += `<button onclick="catalogo.irPagina(${this.filtrosActuales.page + 1})">Siguiente →</button>`;
        }

        html += '</div>';
        container.innerHTML = html;
    }

    // ============================================
    // NAVEGACIÓN DE PÁGINAS
    // ============================================
    async irPagina(page) {
        this.filtrosActuales.page = page;
        await this.cargarProductos();
        window.scrollTo({ top: 400, behavior: 'smooth' });
    }

    // ============================================
    // CONFIGURAR EVENTOS
    // ============================================
    configurarEventos() {
        // Búsqueda con debounce
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(async () => {
                    this.filtrosActuales.search = e.target.value;
                    this.filtrosActuales.page = 1;
                    await this.cargarProductos();
                }, 500);
            });
        }

        // Filtros de categoría
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const categoria = btn.getAttribute('data-categoria');
                if (categoria) {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.filtrosActuales.category = categoria;
                    this.filtrosActuales.page = 1;
                    await this.cargarProductos();
                }
            });
        });

        // Filtro de precio
        const precioMin = document.getElementById('precio-min');
        const precioMax = document.getElementById('precio-max');
        const precioValor = document.getElementById('precio-valor');

        if (precioMin && precioMax && precioValor) {
            let timeout;
            const actualizarPrecios = () => {
                clearTimeout(timeout);
                timeout = setTimeout(async () => {
                    const min = parseInt(precioMin.value);
                    const max = parseInt(precioMax.value);
                    precioValor.textContent = `$${min} - $${max}`;
                    this.filtrosActuales.price_min = min;
                    this.filtrosActuales.price_max = max;
                    this.filtrosActuales.page = 1;
                    await this.cargarProductos();
                }, 300);
            };

            precioMin.addEventListener('input', actualizarPrecios);
            precioMax.addEventListener('input', actualizarPrecios);
        }

        // Botones de galería
        const prevBtn = document.getElementById('galleryPrevBtn');
        const nextBtn = document.getElementById('galleryNextBtn');
        const voiceBtn = document.getElementById('galleryVoiceBtn');

        if (prevBtn) prevBtn.addEventListener('click', () => this.anteriorImagen());
        if (nextBtn) nextBtn.addEventListener('click', () => this.siguienteImagen());
        if (voiceBtn) voiceBtn.addEventListener('click', () => this.iniciarNavegacionVozGaleria());
    }

    // ============================================
    // AGREGAR AL CARRITO
    // ============================================
    async agregarAlCarrito(id, btn) {
        if (!this.token) {
            alert('Debes iniciar sesión para agregar productos al carrito');
            window.location.href = 'Perfil_De_Usuario.html';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/carrito`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ producto_id: id, cantidad: 1 })
            });

            if (response.ok) {
                await this.cargarCarrito();

                const originalText = btn.innerText;
                btn.innerText = "✓ AGREGADO";
                btn.style.background = "#28a745";


                const producto = this.productosFiltrados.find(p => p.id === id);
                if (producto) {
                    let historial = JSON.parse(localStorage.getItem('nexus_historial_categorias') || '[]');
                    historial.push(producto.categoria);
                    // Solo mantener últimos 10
                    if (historial.length > 10) historial.shift();
                    localStorage.setItem('nexus_historial_categorias', JSON.stringify(historial));
                }

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.background = "linear-gradient(45deg, var(--primary), var(--secondary))";
                }, 800);
            } else {
                const error = await response.json();
                alert(error.error || 'Error al agregar al carrito');
            }
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            // Fallback a localStorage
            const producto = this.productosFiltrados.find(p => p.id === id);
            if (producto) {
                let cart = JSON.parse(localStorage.getItem('nexusCart')) || [];
                cart.push(producto);
                localStorage.setItem('nexusCart', JSON.stringify(cart));
                this.actualizarContadorCarrito();
            }
        }
    }

    // ============================================
    // ACTUALIZAR CONTADOR DEL CARRITO
    // ============================================
    actualizarContadorCarrito() {
        const counter = document.getElementById('cart-count');
        if (!counter) return;

        let count = 0;

        if (this.token && this.cart && this.cart.length > 0) {
            count = this.cart.reduce((sum, item) => sum + item.cantidad, 0);
        } else {
            const localCart = JSON.parse(localStorage.getItem('nexusCart')) || [];
            count = localCart.length;
        }

        counter.innerText = count;
        counter.style.transform = 'scale(1.2)';
        setTimeout(() => counter.style.transform = 'scale(1)', 200);
    }

    // ============================================
    // MODAL DEL CARRITO
    // ============================================
    toggleModal() {
        if (!this.token) {
            window.location.href = 'Perfil_De_Usuario.html';
            return;
        }

        const modal = document.getElementById('cartModal');
        if (modal) {
            modal.classList.toggle('active');
            if (modal.classList.contains('active')) {
                this.renderCarrito();
            }
        }
    }

    // ============================================
    // RENDERIZAR CARRITO
    // ============================================
    async renderCarrito() {
        const itemsDiv = document.getElementById('cartItems');
        const totalDiv = document.getElementById('cartTotal');
        const actions = document.getElementById('cartActions');

        if (!itemsDiv) return;

        try {
            let items = [];

            if (this.token) {
                const response = await fetch(`${API_URL}/carrito`, {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });

                if (response.ok) {
                    items = await response.json();
                    this.cart = items;
                }
            }

            if (!items || items.length === 0) {
                // Intentar con localStorage
                items = JSON.parse(localStorage.getItem('nexusCart')) || [];

                if (items.length === 0) {
                    itemsDiv.innerHTML = '<p style="text-align:center; padding: 20px;">El nexo está vacío</p>';
                    if (totalDiv) totalDiv.innerHTML = "";
                    if (actions) actions.style.display = "none";
                    return;
                }
            }

            // Calcular total
            const total = items.reduce((sum, item) => {
                const precio = item.precio || item.price || 0;
                const cantidad = item.cantidad || 1;
                return sum + (precio * cantidad);
            }, 0);

            // Renderizar items
            itemsDiv.innerHTML = items.map(item => {
                const nombre = item.nombre || item.name || 'Producto';
                const precio = item.precio || item.price || 0;
                const cantidad = item.cantidad || 1;
                const id = item.producto_id || item.id;

                return `
                    <div class="cart-item">
                        <div>
                            <strong>${this.escapeHtml(nombre)}</strong>
                            <span style="color: #666; margin-left: 10px;">x${cantidad}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <span style="font-weight: bold;">$${(precio * cantidad).toFixed(2)}</span>
                            <button onclick="catalogo.eliminarDelCarrito(${id})" 
                                    style="background: none; border: none; color: #ff4757; cursor: pointer; font-size: 16px;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            if (totalDiv) {
                totalDiv.innerHTML = `
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid var(--border-light); text-align: right;">
                        <strong style="font-size: 1.2rem;">Total: $${total.toFixed(2)}</strong>
                    </div>
                `;
            }

            if (actions) actions.style.display = "block";

        } catch (error) {
            console.error('Error al renderizar carrito:', error);
            itemsDiv.innerHTML = '<p style="text-align:center; padding: 20px;">Error al cargar el carrito</p>';
        }
    }

    // ============================================
    // ELIMINAR DEL CARRITO
    // ============================================
    async eliminarDelCarrito(id) {
        try {
            if (this.token) {
                await fetch(`${API_URL}/carrito/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
            }

            // También eliminar de localStorage
            let cart = JSON.parse(localStorage.getItem('nexusCart')) || [];
            cart = cart.filter(item => item.id !== id && item.producto_id !== id);
            localStorage.setItem('nexusCart', JSON.stringify(cart));

            await this.cargarCarrito();
            this.renderCarrito();
        } catch (error) {
            console.error('Error al eliminar del carrito:', error);
        }
    }

    // ============================================
    // VACIAR CARRITO
    // ============================================
    clearCart() {
        if (confirm('¿Seguro que quieres vaciar tu nexo?')) {
            localStorage.removeItem('nexusCart');
            this.cart = [];
            this.actualizarContadorCarrito();
            this.renderCarrito();
        }
    }

    // ============================================
    // CHECKOUT
    // ============================================
    async checkout() {
        if (!this.token) {
            alert('Debes iniciar sesión para finalizar la compra');
            window.location.href = 'Perfil_De_Usuario.html';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/ordenes`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                const data = await response.json();
                alert(`¡Compra realizada exitosamente!\n\nNúmero de orden: ${data.orden.id}\nTotal: $${data.orden.total}`);

                // Limpiar carritos
                this.cart = [];
                localStorage.removeItem('nexusCart');
                this.actualizarContadorCarrito();
                this.renderCarrito();

                // Recargar productos para actualizar stock
                await this.cargarProductos();
            } else {
                const error = await response.json();
                alert(error.error || 'Error al procesar la compra');
            }
        } catch (error) {
            console.error('Error en checkout:', error);
            alert('Error al procesar la compra. Intenta de nuevo.');
        }
    }

    // ============================================
    // VER PRODUCTO
    // ============================================
    verProducto(id) {
        const producto = this.productosFiltrados.find(p => p.id === id);
        if (!producto) return;

        // Guardar producto en localStorage
        const productoParaGuardar = {
            id: producto.id,
            name: producto.nombre,
            price: producto.precio,
            cat: producto.categoria,
            icon: producto.icono,
            description: producto.descripcion,
            stock: producto.stock
        };

        localStorage.setItem('productoSeleccionado', JSON.stringify(productoParaGuardar));

        // Redirigir a la página de detalle
        window.open('producto.html', '_blank');
    }

    // ============================================
    // ESCAPAR HTML
    // ============================================
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // MÉTODOS PARA GALERÍA MULTIMEDIA
    // ============================================

    abrirGaleria(productoId) {
        const producto = this.productosFiltrados?.find(p => p.id === productoId);
        if (!producto) return;

        const imagenes = this.obtenerImagenesProducto(producto);
        this.galeriaActual = {
            imagenes: imagenes,
            indiceActual: 0,
            producto: producto
        };

        const modal = document.getElementById('galleryModal');
        const titulo = document.getElementById('galleryProductTitle');
        const mainImg = document.getElementById('galleryMainImage');

        if (titulo) titulo.textContent = producto.nombre;
        if (mainImg) mainImg.src = imagenes[0];

        this.renderizarMiniaturasGaleria(imagenes, 0);

        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');
        }
    }

    obtenerImagenesProducto(producto) {
        const baseImagenes = {
            1: ['https://picsum.photos/id/0/600/600', 'https://picsum.photos/id/1/600/600', 'https://picsum.photos/id/2/600/600', 'https://picsum.photos/id/3/600/600'],
            2: ['https://picsum.photos/id/4/600/600', 'https://picsum.photos/id/5/600/600', 'https://picsum.photos/id/6/600/600', 'https://picsum.photos/id/7/600/600'],
            3: ['https://picsum.photos/id/8/600/600', 'https://picsum.photos/id/9/600/600', 'https://picsum.photos/id/10/600/600', 'https://picsum.photos/id/11/600/600'],
            4: ['https://picsum.photos/id/12/600/600', 'https://picsum.photos/id/13/600/600', 'https://picsum.photos/id/14/600/600', 'https://picsum.photos/id/15/600/600'],
            5: ['https://picsum.photos/id/16/600/600', 'https://picsum.photos/id/17/600/600', 'https://picsum.photos/id/18/600/600', 'https://picsum.photos/id/19/600/600'],
            6: ['https://picsum.photos/id/20/600/600', 'https://picsum.photos/id/21/600/600', 'https://picsum.photos/id/22/600/600', 'https://picsum.photos/id/23/600/600'],
            7: ['https://picsum.photos/id/24/600/600', 'https://picsum.photos/id/25/600/600', 'https://picsum.photos/id/26/600/600', 'https://picsum.photos/id/27/600/600'],
            8: ['https://picsum.photos/id/28/600/600', 'https://picsum.photos/id/29/600/600', 'https://picsum.photos/id/30/600/600', 'https://picsum.photos/id/31/600/600']
        };

        return baseImagenes[producto.id] || [
            'https://picsum.photos/id/0/600/600',
            'https://picsum.photos/id/1/600/600',
            'https://picsum.photos/id/2/600/600',
            'https://picsum.photos/id/3/600/600'
        ];
    }

    renderizarMiniaturasGaleria(imagenes, indiceActivo) {
        const container = document.getElementById('galleryThumbnails');
        if (!container) return;

        container.innerHTML = imagenes.map((img, idx) => `
            <img src="${img}" 
                 alt="Miniatura ${idx + 1}"
                 class="${idx === indiceActivo ? 'active-gallery-thumb' : ''}"
                 onclick="catalogo.cambiarImagenGaleria(${idx})">
        `).join('');
    }

    cambiarImagenGaleria(indice) {
        if (!this.galeriaActual) return;

        const imagenes = this.galeriaActual.imagenes;
        if (indice >= 0 && indice < imagenes.length) {
            this.galeriaActual.indiceActual = indice;
            const mainImg = document.getElementById('galleryMainImage');
            if (mainImg) mainImg.src = imagenes[indice];

            document.querySelectorAll('#galleryThumbnails img').forEach((img, i) => {
                if (i === indice) {
                    img.classList.add('active-gallery-thumb');
                } else {
                    img.classList.remove('active-gallery-thumb');
                }
            });
        }
    }

    siguienteImagen() {
        if (!this.galeriaActual) return;
        const imagenes = this.galeriaActual.imagenes;
        let nuevoIndice = this.galeriaActual.indiceActual + 1;
        if (nuevoIndice >= imagenes.length) nuevoIndice = 0;
        this.cambiarImagenGaleria(nuevoIndice);
    }

    anteriorImagen() {
        if (!this.galeriaActual) return;
        const imagenes = this.galeriaActual.imagenes;
        let nuevoIndice = this.galeriaActual.indiceActual - 1;
        if (nuevoIndice < 0) nuevoIndice = imagenes.length - 1;
        this.cambiarImagenGaleria(nuevoIndice);
    }

    cerrarGaleria() {
        const modal = document.getElementById('galleryModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
        this.galeriaActual = null;
    }

    iniciarNavegacionVozGaleria() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert('Tu navegador no soporta comandos de voz. Usa Chrome o Edge.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-MX';
        recognition.continuous = false;

        const feedback = document.getElementById('voiceFeedback');
        if (feedback) {
            feedback.style.display = 'block';
            feedback.textContent = '🎤 Escuchando... Di: "siguiente", "anterior" o "cerrar"';
        }

        recognition.start();

        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            if (feedback) feedback.textContent = `✅ Comando: "${command}"`;

            if (command.includes('siguiente') || command.includes('próxima') || command.includes('después')) {
                this.siguienteImagen();
                if (feedback) feedback.textContent = '➡️ Siguiente imagen';
            } else if (command.includes('anterior') || command.includes('atrás') || command.includes('previo')) {
                this.anteriorImagen();
                if (feedback) feedback.textContent = '⬅️ Imagen anterior';
            } else if (command.includes('cerrar') || command.includes('salir')) {
                this.cerrarGaleria();
                if (feedback) feedback.textContent = '🔒 Galería cerrada';
            } else {
                if (feedback) feedback.textContent = '❓ No entendí. Di: "siguiente", "anterior" o "cerrar"';
            }

            setTimeout(() => {
                if (feedback) feedback.style.display = 'none';
            }, 2000);
        };

        recognition.onerror = () => {
            if (feedback) {
                feedback.textContent = '❌ No se pudo reconocer el comando';
                setTimeout(() => {
                    feedback.style.display = 'none';
                }, 2000);
            }
        };

        recognition.onend = () => {
            setTimeout(() => {
                if (feedback && feedback.style.display !== 'none') {
                    feedback.style.display = 'none';
                }
            }, 1500);
        };
    }
}

// ============================================
// INICIALIZAR CUANDO EL DOM ESTÉ LISTO
// ============================================
let catalogo;
document.addEventListener('DOMContentLoaded', () => {
    catalogo = new CatalogoAimeos();
});

// voice-ai.js – Asistente de voz e IA predictiva para Nexus Gear

class VoiceAssistant {
    constructor(catalogoInstance) {
        this.catalogo = catalogoInstance;       // Referencia al catálogo global
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.feedbackElement = document.getElementById('voice-feedback');
        this.btn = document.getElementById('voice-assistant-btn');

        this.init();
    }

    init() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Este navegador no soporta reconocimiento de voz. Se requiere Chrome o Edge.');
            if (this.btn) this.btn.style.display = 'none';
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'es-MX';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        this.recognition.onresult = (event) => this.handleCommand(event);
        this.recognition.onerror = (event) => this.handleError(event);
        this.recognition.onend = () => this.stopListening();

        if (this.btn) {
            this.btn.addEventListener('click', () => this.toggleListening());
        }

        // Proactividad: mostrar recomendación después de 10 segundos
        setTimeout(() => this.mostrarRecomendacionProactiva(), 10000);
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        try {
            this.recognition.start();
            this.isListening = true;
            if (this.btn) this.btn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            if (this.feedbackElement) {
                this.feedbackElement.style.display = 'block';
                this.feedbackElement.textContent = '🎤 Te escucho...';
            }
        } catch (e) {
            console.error('Error al iniciar reconocimiento:', e);
        }
    }

    stopListening() {
        this.isListening = false;
        if (this.btn) this.btn.innerHTML = '<i class="fas fa-microphone"></i>';
        if (this.feedbackElement) {
            this.feedbackElement.style.display = 'none';
        }
        // Detener reconocimiento si aún está activo
        try { this.recognition.stop(); } catch (e) { }
    }

    handleCommand(event) {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log('Comando detectado:', transcript);
        this.showFeedback(`✅ ${transcript}`);
        this.processIntent(transcript);
    }

    handleError(event) {
        console.error('Error de voz:', event.error);
        this.showFeedback('❌ No te entendí, intenta de nuevo.');
        this.stopListening();
    }

    showFeedback(message) {
        if (this.feedbackElement) {
            this.feedbackElement.style.display = 'block';
            this.feedbackElement.textContent = message;
            setTimeout(() => {
                if (this.feedbackElement) this.feedbackElement.style.display = 'none';
            }, 3000);
        }
    }

    speak(text) {
        if (!this.synthesis) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX';
        utterance.rate = 1.1;
        this.synthesis.speak(utterance);
    }

    processIntent(text) {
        // Comandos de búsqueda / filtrado
        const busquedaRegex = /buscar?\s+(.+)/i;
        const categoriaRegex = /(filtrar|mostrar|ver)\s*(por)?\s*(categor[ií]a\s*)?(audio|perif[eé]ricos|visual)/i;
        const agregarRegex = /(agregar|añadir|poner)\s*(el\s*)?producto\s*(\d+)\s*(al carrito)?/i;
        const verCarrito = /(abrir|ver|mostrar)\s*(el\s*)?carrito/i;
        const finalizarCompra = /(finalizar|confirmar|hacer)\s*(la\s*)?compra|checkout|comprar/i;
        const recomendacion = /recomi[ée]ndame|qu[eé] me (recomiendas|sugieres)|sugerencia/i;
        const irA = /ir\s*a\s*(inicio|perfil|cat[aá]logo)/i;

        if (busquedaRegex.test(text)) {
            const termino = text.match(busquedaRegex)[1];
            this.catalogo.filtrosActuales.search = termino;
            this.catalogo.filtrosActuales.page = 1;
            document.getElementById('search-input').value = termino;
            this.catalogo.cargarProductos();
            this.speak(`Buscando ${termino}`);
        }
        else if (categoriaRegex.test(text)) {
            const match = text.match(categoriaRegex);
            const cat = match[4].toLowerCase();
            // Mapeo
            const categorias = { 'audio': 'audio', 'periféricos': 'perifericos', 'perifericos': 'perifericos', 'visual': 'visual' };
            const catId = categorias[cat] || cat;
            this.catalogo.filtrosActuales.category = catId;
            this.catalogo.filtrosActuales.page = 1;
            // Activar botón del filtro
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            const btn = document.querySelector(`.filter-btn[data-categoria="${catId}"]`);
            if (btn) btn.classList.add('active');
            this.catalogo.cargarProductos();
            this.speak(`Mostrando categoría ${cat}`);
        }
        else if (agregarRegex.test(text)) {
            const match = text.match(agregarRegex);
            const id = parseInt(match[3]);
            if (!this.catalogo.token) {
                this.speak('Debes iniciar sesión para agregar productos al carrito.');
                return;
            }
            const producto = this.catalogo.productosFiltrados.find(p => p.id === id);
            if (!producto) {
                this.speak('No encontré ese producto.');
                return;
            }
            // Llamar agregar (usa el botón virtual)
            this.catalogo.agregarAlCarrito(id, { innerText: '', style: {} });
            this.speak(`${producto.nombre} agregado al carrito.`);
        }
        else if (verCarrito.test(text)) {
            if (!this.catalogo.token) {
                window.location.href = 'Perfil_De_Usuario.html';
                return;
            }
            this.catalogo.toggleModal();
            this.speak('Abriendo carrito.');
        }
        else if (finalizarCompra.test(text)) {
            if (!this.catalogo.token) {
                this.speak('Inicia sesión para comprar.');
                window.location.href = 'Perfil_De_Usuario.html';
                return;
            }
            this.catalogo.checkout();
            this.speak('Procesando tu compra.');
        }
        else if (recomendacion.test(text)) {
            this.mostrarRecomendacionProactiva(true);
            this.speak('Estas son mis recomendaciones para ti.');
        }
        else if (irA.test(text)) {
            const destino = text.match(irA)[1];
            if (destino === 'inicio') window.location.href = 'nexus.html';
            else if (destino === 'perfil') window.location.href = 'Perfil_De_Usuario.html';
            else if (destino === 'catálogo') window.location.href = 'nexus.html';
            this.speak(`Navegando a ${destino}`);
        }
        else {
            this.speak('No entendí el comando. Prueba con: buscar algo, filtrar por audio, o agregar producto 1 al carrito.');
        }
    }

    // --- Función de recomendación proactiva (IA simulada) ---
    async mostrarRecomendacionProactiva(forzar = false) {
        const usuario = JSON.parse(localStorage.getItem('nexus_current_user'));
        if (!usuario && !forzar) return; // Sin usuario no hay personalización

        // Obtener productos desde el catálogo (usa mock si API no disponible)
        let productos = this.catalogo.productosFiltrados;
        if (!productos || productos.length === 0) {
            productos = this.catalogo.obtenerProductosMock();
        }

        // Lógica de recomendación según nivel de membresía
        const nivel = usuario?.nivel || 'starter';
        let productosRecomendados = [];

        // Reglas de negocio simuladas:
        if (nivel === 'elite') {
            // Los más caros y exclusivos (simulamos que son los de visual y audio de lujo)
            productosRecomendados = productos.filter(p => p.precio >= 300).slice(0, 2);
        } else if (nivel === 'pro') {
            // Productos de gama media-alta
            productosRecomendados = productos.filter(p => p.precio >= 100 && p.precio < 500).slice(0, 2);
        } else {
            // Para starter y invitados: lo más vendido (primeros 3)
            productosRecomendados = productos.slice(0, 3);
        }

        if (productosRecomendados.length === 0) return;

        // Mostrar notificación (toast)
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; top: 80px; right: 20px; background: white; border-radius: 20px;
            padding: 20px; width: 280px; box-shadow: 0 10px 30px rgba(0,168,107,0.3);
            z-index: 9999; border-left: 5px solid var(--primary);
            animation: slideIn 0.5s ease;
        `;
        const lista = productosRecomendados.map(p => `<li style="margin:5px 0;">• ${p.nombre} - $${p.precio}</li>`).join('');
        toast.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px;">
                🤖 Recomendación Nexus ${nivel === 'elite' ? 'Elite' : ''}
            </div>
            <ul style="list-style: none; padding: 0; font-size: 0.9em;">${lista}</ul>
            <button style="margin-top: 10px; background: var(--primary); border:none; color:white; padding: 5px 15px; border-radius: 15px; cursor:pointer;" 
                    onclick="this.parentElement.remove()">Entendido</button>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 8000);
    }
}

// Inicializar cuando el DOM esté listo y el catalogo esté disponible
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que catalogo se haya creado (en script.js se crea en DOMContentLoaded)
    const checkCatalogo = setInterval(() => {
        if (typeof catalogo !== 'undefined') {
            clearInterval(checkCatalogo);
            const voiceAssistant = new VoiceAssistant(catalogo);
            // Opcional: exponer globalmente para depuración
            window.voiceAssistant = voiceAssistant;
        }
    }, 100);
});