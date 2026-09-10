const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const sessionMiddleware = session({
  secret: "supersarasa",
  resave: false,
  saveUninitialized: false,
});
app.use(sessionMiddleware);

const server = app.listen(PORT, () => {
  console.log(`Servidor NodeJS corriendo en http://localhost:${PORT}/`);
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

let contador = 0;

io.on("connection", (socket) => {
  const req = socket.request;

  socket.on("joinRoom", (data) => {
    if (req.session.room != undefined && req.session.room.length > 0) {
      socket.leave(req.session.room);
    }
    req.session.room = data.room;
    socket.join(req.session.room);

    io.to(req.session.room).emit("chat-messages", {
      user: req.session.user,
      room: req.session.room,
    });
  });

  socket.on("pingAll", (data) => {
    console.log("PING ALL:", data);
    io.emit("pingAll", { event: "Ping to all", message: data });
  });

  socket.on("sendMessage", (data) => {
    io.to(req.session.room).emit("newMessage", {
      room: req.session.room,
      message: data.message,
    });
  });

  socket.on("eventoPersonalizado", () => {
    contador++;
    socket.emit("respuestaPersonalizada", { contador });
  });

  socket.on("disconnect", () => {
    console.log("Disconnect");
  });
});


//BACKEND WHATSAPP:
//1. REGISTRO

app.post("/register", async function (req, res) {
    console.log(req.body)
    let respuesta = await realizarQuery(`
    SELECT * FROM UsuariosWhatsapp WHERE nombre="${req.body.nombre}" and correo = "${req.body.correo}" and contraseña="${req.body.contraseña}";
        `)
    if (respuesta.length > 0) {
        res.send({ message: "El usuario ya existe" })
    } else {
        let resultado= await realizarQuery(`INSERT INTO UsuariosWhatsapp(nombre, correo, contraseña) VALUES ("${req.body.nombre}","${req.body.correo}","${req.body.contraseña}");`)
        
        const nuevoId = resultado.insertId; // Obtener el ID del nuevo usuario insertado
        console.log("Nuevo usuario agregado con ID:", nuevoId);
        res.send({ ok: true,
                message: "Usuario Agregado", 
                id_usuario: nuevoId })
    }
}) 

// SESION

app.post("/login", async function(req, res){
    try {
        console.log("Datos recibidos en sesión:", req.body);
        let respuesta = await realizarQuery(`
            SELECT * FROM UsuariosWhatsapp WHERE correo = "${req.body.correo}" AND contraseña = "${req.body.contraseña}";
        `);

        if (respuesta.length > 0) {
            // Usamos id_usuario en minúsculas porque viene de la tabla Usuarios
            const idDetectado = respuesta[0].id_usuario; 

            // Guardamos al usuario en la sesión para poder usarlo después (ej: en los sockets)
            req.session.user = {
                id_usuario: respuesta[0].id_usuario,
                nombre: respuesta[0].nombre,
                correo: respuesta[0].correo,
            };

            res.send({
                message: "Inicio de Sesion exitoso",
                id_usuario: idDetectado
            });
        } else {
            res.send({
                message: "Usuario no existe"
            });
        }
    } catch (error) {
        console.error("Error en UsuariosSesion:", error);
        res.status(500).send({ message: "Error interno del servidor", error: error.message });
    }
});

// 2. LISTADO DE CHATS:
app.get('/Chats/:id_usuario', async function (req, res) {
  try{
    const {id_usuario} = req.params;
    const chats = await realizarQuery(`SELECT c.id_chat, c.nom_grupo FROM Chats c INNER JOIN UsuariosEnChats uc ON uc.id_chat = c.id_chat WHERE uc.id_usuario =? `,[id_usuario]);

    const chatsConDatos = await Promise.all(
      chats.map(async(chat) =>{
        const participantes = await realizarQuery(`SELECT u.id_usuario, u.nombre, u.foto_perfil FROM UsuarioEnChats uc INNER JOIN UsuariosWhatsapp u ON u.id_usuario = uc.id_usuario WHERE uc.id_chat =? AND uc.id_usuario !=?`,
          [chat.id_chat,id_usuario]
        );
        const esGrupal = participantes.length >1;
        return{
          id_chat: chat.id_chat,
          es_grupal: esGrupal,
          nombre_mostrado: esGrupal ? chat.nom_grupo : participantes[0]
        }
      })
    )
    let respuesta;
    if (req.query.id_preguntas != undefined) {
        respuesta = await realizarQuery(`SELECT * FROM Mensajes WHERE id_usuario=${req.query.id_usuario}`)
    } else {
        respuesta = await realizarQuery("SELECT * FROM Mensajes");
    }
    res.send(respuesta);
  }

})