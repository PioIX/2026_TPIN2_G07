# 2026_TPIN2_G07
Trabajo Practico integrador: WhatsApp
# WhatsApp

Aplicación de chat en tiempo real 
El proyecto es una aplicación similar a WhatsApp que permite a los usuarios  se registren, inicien sesión, visualizar sus conversaciones, crear chats individuales y grupales, consultar el historial de mensajes y comunicarse en tiempo real.

## Metodos 

* **Frontend:** Next.js + React
* **Backend:** Node.js
* **Base de datos:** MySQL
* **Comunicación en tiempo real:** Socket.IO / WebSockets
* **Estilos:** CSS
* **Control de versiones:** Git + GitHub

## Funciones

### Usuarios

* Registro de nuevos usuarios.
* Inicio de sesión mediante mail y contraseña.
* Perfil con nombre de usuario y foto.

### Chats

* Visualización de los chats del usuario.
* Creación de chats individuales mediante el mail de otro usuario.
* Creación de chats grupales mediante múltiples mails.
* Nombre y foto para los grupos.
* Foto por defecto cuando un chat no posee imagen.

###  Chat en tiempo real

* Visualización del historial de mensajes almacenado en MySQL.
* Envío y recepción de mensajes mediante Socket.IO.
* Los mensajes aparecen en tiempo real para los usuarios que tienen abierto el mismo chat.
* Los mensajes enviados se almacenan en la base de datos para conservar el historial.

##  Base de datos

Una base de datos MySQL con tablas relacionadas para representar:

* Usuarios
* Chats / conversaciones
* Mensajes
* Integrantes de los chats


## Integrantes

* Sofia Streuli 
* Catlina Gonzalez Cerezal
* Avril Polvera
* Felicitas Scarfo

## 📁 Estructura del proyecto

```text
proyecto/
│
├── frontend/src
│   ├── app/
│   ├── components/
│   ├── hooks
│   └── ...
│
├── backend/
│   ├── index.js
│   └── package.json
│   └── modulos/mysql
│
├── .gitignore
└── README.md
```

**Trabajo Práctico Integrador — Pio Chat**
**5to año — Especialidad Informática**
