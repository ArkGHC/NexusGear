# Nexus Gear - Plataforma E-commerce Web 4.0

Prototipo funcional de alta fidelidad para el ecosistema Nexus Gear, especializado en hardware para gamers, creadores de contenido y profesionales tech.

## Stack Tecnológico
* **Frontend:** HTML5, CSS3 (Variables nativas), Vanilla JS (ES6+)
* **Backend:** Aimeos Core v2024.10 (PHP/Laravel) + MySQL + Docker

## Instalación del Entorno (Backend)
1. Clonar el repositorio base de Aimeos: `git clone https://github.com/nexusgear/aimeos-shop.git`
2. Levantar contenedores: `cd aimeos-shop && docker-compose up -d`
3. Poblar base de datos: `./aimeos-cli setup:database --with-demo-data`
## Acceso a MySQL (root) y gestión de contraseña
### Login verificado (PowerShell)
```powershell
$rootLine = (docker inspect nexus_database --format "{{range .Config.Env}}{{println .}}{{end}}" | Select-String "^MYSQL_ROOT_PASSWORD=").Line
$rootPwd = $rootLine.Substring("MYSQL_ROOT_PASSWORD=".Length)
docker exec -e MYSQL_PWD=$rootPwd -it nexus_database mysql -u root
```

### Notas importantes
* `docker exec -it nexus_database mysql -u root -p` requiere ingresar manualmente la contraseña y puede fallar por errores de tipeo.
* El comando verificado evita ese problema al usar `MYSQL_PWD` temporalmente para autenticar dentro del contenedor.

### Cambiar contraseña root (sin borrar datos)
Dentro de MySQL:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### Reinicializar credenciales (destructivo)
Si necesitas que se reapliquen variables como `MYSQL_ROOT_PASSWORD` desde cero:
```powershell
docker compose down -v
docker compose up -d
```
Esto elimina el volumen de MySQL y todos los datos persistidos.
