# Space Academy 🚀🌌

Plataforma educativa interactiva diseñada para **Sofía** y **Luciano** (1º y 2º Básico, Chile) para aprender y repasar asignaturas escolares (**Inglés**, **Matemáticas** y **Ciencias Naturales**) a través de misiones espaciales gamificadas.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React + TypeScript + Vite (Puerto `3000`). Soporte de sintetizador de voz (Web Speech API) y efectos de sonido arcade (Web Audio API).
- **Backend**: Golang con framework **Gin** (Puerto `8080` en contenedor / `8081` en host).
- **Base de Datos**: SQLite (`./data/game.db`) para persistencia de progreso, estrellas, medallas y stickers.
- **Orquestación**: Docker Compose.
- **Infraestructura Cloud**: AWS EC2 (`t3.micro`, disco 8GB gp3) + Route 53 (`academy.nparrado.net`).

---

## ☁️ Gestión en AWS (Despliegue On-Demand y Ahorro de Costos)

La aplicación corre en la nube bajo un modelo **On-Demand de costo mínimo** (~$0.80 USD/mes), sin IP Elástica fija para evitar cobros innecesarios mientras la máquina está apagada.

Para encender y apagar el servidor fácilmente desde tu Mac, utiliza el script automatizado [`scripts/academy`](file:///Users/nparrado/dev/Personal/alumnos/Sofia/2_Basico/Ingles/scripts/academy):

### 🚀 1. Encender el Servidor (Para estudiar)
```bash
./scripts/academy start
```
* Inicia la instancia EC2 (`i-06d681750a6c978e8`).
* Espera a que el servidor esté activo y obtiene la nueva IP pública dinámica.
* **Actualiza automáticamente el registro DNS en Route 53** (`academy.nparrado.net`).
* Acceso web: [http://academy.nparrado.net:3000](http://academy.nparrado.net:3000).

### 🛑 2. Apagar el Servidor (Fin del estudio)
```bash
./scripts/academy stop
```
* Detiene la máquina EC2 y detiene inmediatamente el cobro por cómputo de AWS.

### 📊 3. Ver Estado del Servidor
```bash
./scripts/academy status
```
* Muestra el estado de la instancia (RUNNING/STOPPED), la IP pública actual y el estado de la alarma de auto-apagado.

---

## ⏱️ Auto-Apagado de Seguridad (CloudWatch)

Para evitar gastos por olvido si la máquina queda encendida:
- Cuenta con una alarma de **CloudWatch (`ec2-auto-stop-academy-idle`)**.
- Si el servidor permanece inactivo (**CPU < 2% durante 45 minutos** consecutivos), **AWS apagará la instancia automáticamente**.

---

## 🔑 Acceso SSH Simplificado

Para conectarte a la máquina EC2 sin preocuparte por los cambios de IP dinámica, configura en tu archivo `~/.ssh/config`:

```sshconfig
Host maquina_mates
    HostName academy.nparrado.net
    User ec2-user
    IdentityFile ~/.ssh/tu-llave.pem
```

Una vez configurado, podrás entrar directamente con:
```bash
ssh maquina_mates
```

---

## 💻 Ejecución en Entorno Local (Desarrollo)

Si prefieres correr la aplicación de forma 100% local en tu computador:

1. **Construir y levantar contenedores:**
   ```bash
   docker compose up --build
   ```
2. **Acceder a la aplicación:**
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:8081/api/subjects](http://localhost:8081/api/subjects)

3. **Detener contenedores:**
   ```bash
   docker compose down
   ```

---

## 📂 Estructura del Repositorio

- `frontend/`: SPA en React, componentes de vista, mapas por asignatura y minijuegos temáticos.
- `backend/`: API REST en Go, cargador modular de asignaturas y cálculo de medallas/stickers.
  - `backend/data/subjects/`: JSONs de contenido educativo (Inglés, Matemáticas, Ciencias Naturales).
- `scripts/`: Herramientas de administración y automatización (`academy.py`, `academy`).
- `data/`: Directorio local persistente para la base de datos SQLite `game.db`.

---

## 🔐 Restablecimiento de Datos (Para Papá)

El progreso individual de los alumnos se puede reiniciar desde el panel de **Tabla de Honor** en la interfaz web, el cual requiere escribir la palabra clave **`papa`** para autorizar el borrado en la base de datos.
