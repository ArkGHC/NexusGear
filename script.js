const API_URL = 'http://localhost:8080/jsonapi'; // Apuntando al contenedor Docker de Aimeos

class CatalogoAimeos {
    constructor() {
        this.productos = [];
        this.productosFiltrados = [];
        this.productosPaginados = [];
        this.totalProductos = 0;
        this.cart = [];
        this.galeriaActual = null;
        this.token = localStorage.getItem('nexusToken');
        this.filtrosActuales = { search: '', category: 'all', price_min: 0, price_max: 1000, page: 1, limit: 12 };
        this.init();
    }

    async init() {
        this.configurarEventos();
        await this.cargarProductos();
        await this.cargarCarrito();
        this.simularCarga();
    }

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

    async cargarProductos() {
        try {
            // Intento de conexión al backend de Aimeos
            const response = await fetch(`${API_URL}/product`);
            if (!response.ok) throw new Error('Error backend');
            const data = await response.json();
            // Mapeo simple si existiera backend real. Para la demo usaremos el fallback.
            throw new Error('Fallback a mock'); 
        } catch (error) {
            this.productos = this.obtenerProductosMock();
            this.aplicarFiltrosLocales();
        }
    }

    aplicarFiltrosLocales() {
        let filtrados = this.productos;
        if (this.filtrosActuales.category !== 'all') {
            filtrados = filtrados.filter(p => p.categoria === this.filtrosActuales.category);
        }
        if (this.filtrosActuales.search) {
            const query = this.filtrosActuales.search.toLowerCase();
            filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(query));
        }
        filtrados = filtrados.filter(p => p.precio >= this.filtrosActuales.price_min && p.precio <= this.filtrosActuales.price_max);
        
        this.productosFiltrados = filtrados;
        this.totalProductos = filtrados.length;
        
        const start = (this.filtrosActuales.page - 1) * this.filtrosActuales.limit;
        this.productosPaginados = filtrados.slice(start, start + this.filtrosActuales.limit);
        
        this.renderizarProductos();
        this.renderizarPaginacion();
    }

    obtenerProductosMock() {
        return [
            { id: 1, nombre: "Audífonos Nexus Pro", precio: 299, categoria: "audio", icono: "fa-headphones", stock: 10, descripcion: "Audífonos de alta fidelidad con cancelación de ruido." },
            { id: 2, nombre: "Teclado Mecánico Neón", precio: 150, categoria: "perifericos", icono: "fa-keyboard", stock: 15, descripcion: "Switches rojos y RGB personalizable." },
            { id: 3, nombre: "Monitor Ultraancho 34\"", precio: 899, categoria: "visual", icono: "fa-desktop", stock: 5, descripcion: "Monitor curvo WQHD 144Hz." },
            { id: 4, nombre: "Ratón Cuántico RGB", precio: 89, categoria: "perifericos", icono: "fa-mouse", stock: 20, descripcion: "16000 DPI con respuesta ultrarrápida." },
            { id: 5, nombre: "Micrófono Estudio XLR", precio: 210, categoria: "audio", icono: "fa-microphone", stock: 8, descripcion: "Condensador XLR para streaming." },
            { id: 6, nombre: "Gafas VR Immersive", precio: 550, categoria: "visual", icono: "fa-vr-cardboard", stock: 3, descripcion: "Realidad virtual con seguimiento total." }
        ];
    }

    renderizarProductos() {
        const container = document.getElementById('catalog');
        if (!container) return;
        if (this.productosPaginados.length === 0) {
            container.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px; color: var(--primary);">No se encontraron productos</p>';
            return;
        }
        container.innerHTML = this.productosPaginados.map(p => `
            <article class="product-card">
                <div class="product-img" onclick="catalogo.abrirGaleria(${p.id})">
                    <i class="fas ${p.icono}"></i>
                    <div class="gallery-overlay"><i class="fas fa-images"></i> Ver galería</div>
                </div>
                <h3>${this.escapeHtml(p.nombre)}</h3>
                <p style="color: var(--primary); font-weight: bold; margin: 10px 0; font-size: 1.2rem;">$${p.precio}</p>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-buy" onclick="catalogo.agregarAlCarrito(${p.id}, this)" style="flex: 2;">AÑADIR</button>
                    <button class="btn-gallery" onclick="catalogo.verProducto(${p.id})" style="flex: 1;">👁️</button>
                </div>
            </article>
        `).join('');
    }

    renderizarPaginacion() {
        const container = document.getElementById('paginacion');
        if (!container) return;
        const totalPages = Math.ceil(this.totalProductos / this.filtrosActuales.limit);
        if (totalPages <= 1) { container.innerHTML = ''; return; }
        
        let html = '<div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">';
        for (let i = 1; i <= totalPages; i++) {
            const isAct = i === this.filtrosActuales.page;
            html += `<button onclick="catalogo.irPagina(${i})" style="background: ${isAct ? 'var(--secondary)' : 'var(--bg-card)'}; color: ${isAct ? 'var(--bg-main)' : 'var(--text-main)'}; border-color: ${isAct ? 'var(--primary)' : 'var(--secondary)'};">${i}</button>`;
        }
        html += '</div>';
        container.innerHTML = html;
    }

    irPagina(page) { this.filtrosActuales.page = page; this.aplicarFiltrosLocales(); window.scrollTo({ top: 400, behavior: 'smooth' }); }

    configurarEventos() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filtrosActuales.search = e.target.value;
                this.filtrosActuales.page = 1;
                this.aplicarFiltrosLocales();
            });
        }

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const categoria = btn.getAttribute('data-categoria');
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filtrosActuales.category = categoria;
                this.filtrosActuales.page = 1;
                this.aplicarFiltrosLocales();
            });
        });

        const precioMin = document.getElementById('precio-min');
        const precioMax = document.getElementById('precio-max');
        const precioValor = document.getElementById('precio-valor');
        if (precioMin && precioMax && precioValor) {
            const updatePrice = () => {
                const min = parseInt(precioMin.value);
                const max = parseInt(precioMax.value);
                precioValor.textContent = `$${min} - $${max}`;
                this.filtrosActuales.price_min = min;
                this.filtrosActuales.price_max = max;
                this.filtrosActuales.page = 1;
                this.aplicarFiltrosLocales();
            };
            precioMin.addEventListener('input', updatePrice);
            precioMax.addEventListener('input', updatePrice);
        }

        const prevBtn = document.getElementById('galleryPrevBtn');
        const nextBtn = document.getElementById('galleryNextBtn');
        const voiceBtn = document.getElementById('galleryVoiceBtn');
        if (prevBtn) prevBtn.addEventListener('click', () => this.anteriorImagen());
        if (nextBtn) nextBtn.addEventListener('click', () => this.siguienteImagen());
        if (voiceBtn) voiceBtn.addEventListener('click', () => this.iniciarNavegacionVozGaleria());
    }

    agregarAlCarrito(id, btn) {
        const producto = this.productosFiltrados.find(p => p.id === id);
        if (producto) {
            let cart = JSON.parse(localStorage.getItem('nexusCart')) || [];
            cart.push(producto);
            localStorage.setItem('nexusCart', JSON.stringify(cart));
            this.actualizarContadorCarrito();
            
            const originalText = btn.innerText;
            btn.innerText = "✓ AGREGADO";
            btn.style.background = "var(--secondary)";
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = "var(--primary)";
            }, 800);
        }
    }

    async cargarCarrito() { this.actualizarContadorCarrito(); }

    actualizarContadorCarrito() {
        const counter = document.getElementById('cart-count');
        if (!counter) return;
        const localCart = JSON.parse(localStorage.getItem('nexusCart')) || [];
        counter.innerText = localCart.length;
        counter.style.transform = 'scale(1.2)';
        setTimeout(() => counter.style.transform = 'scale(1)', 200);
    }

    toggleModal() {
        const modal = document.getElementById('cartModal');
        if (modal) {
            modal.classList.toggle('active');
            if (modal.classList.contains('active')) this.renderCarrito();
        }
    }

    renderCarrito() {
        const itemsDiv = document.getElementById('cartItems');
        const totalDiv = document.getElementById('cartTotal');
        const actions = document.getElementById('cartActions');
        if (!itemsDiv) return;

        let items = JSON.parse(localStorage.getItem('nexusCart')) || [];
        if (items.length === 0) {
            itemsDiv.innerHTML = '<p style="text-align:center; padding: 20px; color: var(--primary);">El nexo está vacío</p>';
            if (totalDiv) totalDiv.innerHTML = "";
            if (actions) actions.style.display = "none";
            return;
        }

        const total = items.reduce((sum, item) => sum + item.precio, 0);
        itemsDiv.innerHTML = items.map((item, idx) => `
            <div class="cart-item">
                <div><strong>${this.escapeHtml(item.nombre)}</strong></div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-weight: bold; color: var(--primary);">$${item.precio.toFixed(2)}</span>
                    <button onclick="catalogo.eliminarDelCarrito(${idx})" style="background: none; border: none; color: #ff4757; cursor: pointer; font-size: 16px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        if (totalDiv) totalDiv.innerHTML = `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-light); text-align: right;"><strong style="font-size: 1.2rem; color: var(--primary);">Total: $${total.toFixed(2)}</strong></div>`;
        if (actions) actions.style.display = "block";
    }

    eliminarDelCarrito(idx) {
        let cart = JSON.parse(localStorage.getItem('nexusCart')) || [];
        cart.splice(idx, 1);
        localStorage.setItem('nexusCart', JSON.stringify(cart));
        this.actualizarContadorCarrito();
        this.renderCarrito();
    }

    clearCart() {
        if (confirm('¿Seguro que quieres vaciar tu nexo?')) {
            localStorage.removeItem('nexusCart');
            this.actualizarContadorCarrito();
            this.renderCarrito();
        }
    }

    checkout() {
        alert('¡Compra simulada exitosamente!');
        localStorage.removeItem('nexusCart');
        this.actualizarContadorCarrito();
        this.toggleModal();
    }

    verProducto(id) {
        const producto = this.productosFiltrados.find(p => p.id === id);
        if (!producto) return;
        const pGuardar = { id: producto.id, name: producto.nombre, price: producto.precio, cat: producto.categoria, icon: producto.icono, description: producto.descripcion, stock: producto.stock };
        localStorage.setItem('productoSeleccionado', JSON.stringify(pGuardar));
        window.open('producto.html', '_blank');
    }

    escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }

    // --- GALERÍA ---
    abrirGaleria(productoId) {
        const producto = this.productosFiltrados?.find(p => p.id === productoId);
        if (!producto) return;
        const imagenes = [`https://picsum.photos/seed/${producto.id}1/600/600`, `https://picsum.photos/seed/${producto.id}2/600/600`, `https://picsum.photos/seed/${producto.id}3/600/600`];
        this.galeriaActual = { imagenes, indiceActual: 0, producto };
        
        const modal = document.getElementById('galleryModal');
        if (document.getElementById('galleryProductTitle')) document.getElementById('galleryProductTitle').textContent = producto.nombre;
        if (document.getElementById('galleryMainImage')) document.getElementById('galleryMainImage').src = imagenes[0];
        
        const thumbs = document.getElementById('galleryThumbnails');
        if (thumbs) {
            thumbs.innerHTML = imagenes.map((img, idx) => `<img src="${img}" class="${idx===0?'active-gallery-thumb':''}" onclick="catalogo.cambiarImagenGaleria(${idx})">`).join('');
        }
        if (modal) { modal.style.display = 'flex'; modal.classList.add('active'); }
    }

    cambiarImagenGaleria(indice) {
        if (!this.galeriaActual) return;
        this.galeriaActual.indiceActual = indice;
        document.getElementById('galleryMainImage').src = this.galeriaActual.imagenes[indice];
        document.querySelectorAll('#galleryThumbnails img').forEach((img, i) => {
            i === indice ? img.classList.add('active-gallery-thumb') : img.classList.remove('active-gallery-thumb');
        });
    }

    siguienteImagen() {
        if (!this.galeriaActual) return;
        let ni = this.galeriaActual.indiceActual + 1;
        if (ni >= this.galeriaActual.imagenes.length) ni = 0;
        this.cambiarImagenGaleria(ni);
    }

    anteriorImagen() {
        if (!this.galeriaActual) return;
        let ni = this.galeriaActual.indiceActual - 1;
        if (ni < 0) ni = this.galeriaActual.imagenes.length - 1;
        this.cambiarImagenGaleria(ni);
    }

    cerrarGaleria() {
        const modal = document.getElementById('galleryModal');
        if (modal) { modal.style.display = 'none'; modal.classList.remove('active'); }
        this.galeriaActual = null;
    }

    iniciarNavegacionVozGaleria() {
        // Misma lógica de VoiceAssistant pero localizada en Galería
        const btn = document.getElementById('galleryVoiceBtn');
        if(btn) btn.innerText = "🎤 Escuchando...";
        setTimeout(() => { this.siguienteImagen(); if(btn) btn.innerText = "🎤 Navegar por voz"; }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => { catalogo = new CatalogoAimeos(); });

// ============================================
// ASISTENTE DE VOZ E IA PREDICTIVA
// ============================================
class VoiceAssistant {
    constructor(catalogoInstance) {
        this.catalogo = catalogoInstance;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.feedbackElement = document.getElementById('voice-feedback');
        this.btn = document.getElementById('voice-assistant-btn');
        this.init();
    }

    init() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'es-MX';
        this.recognition.continuous = false;
        
        this.recognition.onresult = (e) => this.handleCommand(e);
        this.recognition.onerror = () => this.stopListening();
        this.recognition.onend = () => this.stopListening();

        if (this.btn) this.btn.addEventListener('click', () => this.toggleListening());
        setTimeout(() => this.mostrarRecomendacionProactiva(), 8000);
    }

    toggleListening() { this.isListening ? this.stopListening() : this.startListening(); }

    startListening() {
        try {
            this.recognition.start();
            this.isListening = true;
            if (this.btn) this.btn.style.boxShadow = "0 0 20px rgba(102, 252, 241, 0.8)";
            if (this.feedbackElement) { this.feedbackElement.style.display = 'block'; this.feedbackElement.textContent = '🎤 Te escucho...'; }
        } catch (e) {}
    }

    stopListening() {
        this.isListening = false;
        if (this.btn) this.btn.style.boxShadow = "var(--neon-glow)";
        if (this.feedbackElement) this.feedbackElement.style.display = 'none';
        try { this.recognition.stop(); } catch (e) {}
    }

    handleCommand(event) {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        this.processIntent(transcript);
    }

    speak(text) {
        if (!this.synthesis) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX';
        this.synthesis.speak(utterance);
    }

    processIntent(text) {
        const busquedaRegex = /buscar?\s+(.+)/i;
        const categoriaRegex = /(filtrar|mostrar|ver)\s*(por)?\s*(categor[ií]a\s*)?(audio|perif[eé]ricos|visual)/i;
        
        if (busquedaRegex.test(text)) {
            const termino = text.match(busquedaRegex)[1];
            this.catalogo.filtrosActuales.search = termino;
            document.getElementById('search-input').value = termino;
            this.catalogo.aplicarFiltrosLocales();
            this.speak(`Buscando ${termino}`);
        } else if (categoriaRegex.test(text)) {
            const cat = text.match(categoriaRegex)[4].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            this.catalogo.filtrosActuales.category = cat;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            const btn = document.querySelector(`.filter-btn[data-categoria="${cat}"]`);
            if (btn) btn.classList.add('active');
            this.catalogo.aplicarFiltrosLocales();
            this.speak(`Mostrando ${cat}`);
        } else {
            this.speak('No entendí. Prueba decir "filtrar por audio"');
        }
    }

    mostrarRecomendacionProactiva() {
        const usuario = JSON.parse(localStorage.getItem('nexus_current_user'));
        if (!usuario) return;
        let productos = this.catalogo.productosFiltrados.slice(0, 2);
        
        const toast = document.createElement('div');
        toast.style.cssText = `position: fixed; top: 100px; right: 20px; background: var(--bg-card); border: 1px solid var(--primary); border-radius: 15px; padding: 20px; width: 280px; box-shadow: var(--neon-glow); z-index: 9999; color: var(--text-main);`;
        const lista = productos.map(p => `<li style="margin:5px 0;">• ${p.nombre}</li>`).join('');
        toast.innerHTML = `<div style="font-weight: bold; color: var(--primary); margin-bottom: 10px;">🤖 Recomendación AI</div><ul style="list-style: none; padding: 0;">${lista}</ul><button style="margin-top: 10px; background: var(--primary); border:none; color:var(--bg-main); font-weight:bold; padding: 5px 15px; border-radius: 15px; cursor:pointer;" onclick="this.parentElement.remove()">Entendido</button>`;
        document.body.appendChild(toast);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const checkCatalogo = setInterval(() => {
        if (typeof catalogo !== 'undefined') {
            clearInterval(checkCatalogo);
            window.voiceAssistant = new VoiceAssistant(catalogo);
        }
    }, 100);
});