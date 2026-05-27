# Nexus Gear - Plataforma E-commerce Web 4.0

Prototipo funcional de alta fidelidad para el ecosistema Nexus Gear, especializado en hardware para gamers, creadores de contenido y profesionales tech.

## Stack Tecnológico
* **Frontend:** HTML5, CSS3 (Variables nativas), Vanilla JS (ES6+)
* **Backend:** Aimeos Core v2024.10 (PHP/Laravel) + MySQL + Docker

## Instalación del Entorno (Backend)
1. Clonar el repositorio base de Aimeos: `git clone https://github.com/nexusgear/aimeos-shop.git`
2. Levantar contenedores: `cd aimeos-shop && docker-compose up -d`
3. Poblar base de datos: `./aimeos-cli setup:database --with-demo-data`