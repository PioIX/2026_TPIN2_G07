const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { Server } = require("socket.io");
const { realizarQuery } = require('./modulo/mysql');

//
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



// PUNTO C Y D
socket.on("sendMessage", async (data) =>{
  try {
    const idChat = req.session.room || data.id_chat;
    const idUsuario = req.session.user ? req.session.user.id_usuario : data.id_usuario;
    const textoMensaje = data.message;

    if(idChat && idUsuario && textoMensaje){
      await realizarQuery('INSERT INTO Mensajes(id_chat,id_usuario,texto,hora_enviada) VALUES(?,?,?, NOW())',[idChat,idUsuario,textoMensaje]);
    }

    io.to(idChat).emit("newMessage",{
      room: idChat,
      message: textoMensaje,
      id_usuario: idUsuario
    });
  } catch (error) {
    console.error("Error al persistir mensaje por socket:", error);
    
  }
});
//
  socket.on("eventoPersonalizado", () => {
    contador++;
    socket.emit("respuestaPersonalizada", { contador });
  });

  socket.on("disconnect", () => {
    console.log("Disconnect");
  });
});


// REGISTRO:
app.post("/register", async function name(req,res) {

  try{
    let respuesta = await realizarQuery(`SELECT * FROM UsuariosWhatsapp WHERE correo = "${req.body.correo}";`);

    if(respuesta.length > 0){
      res.send({message:"El usuario ya existe"});
    }else{
      let resultado = await realizarQuery(`INSERT INTO UsuariosWhatsap(nombre,correo,contraseña,foto) VALUES ("${req.body.nombre}","${req.body.correo}","${req.body.contraseña}","${req.body.foto}");`)

      const nuevoId= resultado.insertId;
      res.send({
        ok: true,
        message:"Usuario Agregado",
        id_usuario:nuevoId
      });
    }
  }catch(error){
    res.status(500).send({ message: "Error en el servidor", error: error.message });
  }
  
});


// LOGIN:
app.post("/login", async function (req,res) {
  try {
    console.log("Datos recibidos en sesión:", req.body);
    let respuesta = await realizarQuery(`SELECT * FROM UsuariosWhatsapp WHERE correo = "${req.body.correo}" AND contraseña = "${req.body.contraseña}";`);

    if(respuesta.length > 0){
      const idDetectado = respuesta[0].id_usuario;

      res.send({
        message:"Inicio de sesion hecho",
        id_usuario: idDetectado,
      });
    }else{
      res.send({
        message: "Usuario inexistente"
      });
    }
  } catch (error) {
    res.status(500).send({ message: "Error al obtener historial de mensajes", error: error.message });
    
  }
  
});

// LISTADO DE CHATS:
app.get("/chats/:id_usuario", async function(req, res) {
    try {
        const { id_usuario } = req.params;
        const chats = await realizarQuery(`
            SELECT c.id_chat, c.nom_grupo, 
                   u.foto AS foto_contacto, u.nombre AS nombre_contacto
            FROM UsuarioEnChats uec
            JOIN Chats c ON uec.id_chat = c.id_chat
            LEFT JOIN UsuarioEnChats uec2 ON c.id_chat = uec2.id_chat AND uec2.id_usuario != ?
            LEFT JOIN UsuariosWhatsapp u ON uec2.id_usuario = u.id_usuario
            WHERE uec.id_usuario = ?
        `, [id_usuario, id_usuario]);

        res.send({ ok: true, chats });
    } catch (error) {
        res.status(500).send({ message: "Error al listar chats", error: error.message });
    }
});



// CREACION DE CHAT INDIVIDUAL:
app.post("/chat/individual", async function(req, res) {
    try {
        const { id_usuario_creador, correo_destinatario } = req.body;
        
        const destinatario = await realizarQuery(`SELECT id_usuario FROM UsuariosWhatsapp WHERE correo = ?`, [correo_destinatario]);
        if (destinatario.length === 0) {
            return res.status(404).send({ message: "El usuario destinatario no existe" });
        }
        const id_destinatario = destinatario[0].id_usuario;

        const resultadoChat = await realizarQuery(`INSERT INTO Chats (nom_grupo) VALUES (NULL)`);
        const id_chat = resultadoChat.insertId;

        await realizarQuery(`INSERT INTO UsuarioEnChats (id_chat, id_usuario) VALUES (?, ?), (?, ?)`, 
            [id_chat, id_usuario_creador, id_chat, id_destinatario]);

        res.send({ ok: true, message: "Chat creado con éxito", id_chat });
    } catch (error) {
        res.status(500).send({ message: "Error al crear chat individual", error: error.message });
    }
});

//CREACION DE CHAT DE GRUPO:
app.post("/chat/grupal", async function(req, res) {
    try {
        const { nom_grupo, id_usuario_creador, correos, foto_grupo } = req.body;

        const resultadoChat = await realizarQuery(`INSERT INTO Chats (nom_grupo) VALUES (?)`, [nom_grupo]);
        const id_chat = resultadoChat.insertId;

        await realizarQuery(`INSERT INTO UsuarioEnChats (id_chat, id_usuario, foto_grupo) VALUES (?, ?, ?)`, 
            [id_chat, id_usuario_creador, foto_grupo || null]);

        if (correos && correos.length > 0) {
            for (let correo of correos) {
                const usuario = await realizarQuery(`SELECT id_usuario FROM UsuariosWhatsapp WHERE correo = ?`, [correo]);
                if (usuario.length > 0) {
                    await realizarQuery(`INSERT INTO UsuarioEnChats (id_chat, id_usuario) VALUES (?, ?)`, [id_chat, usuario[0].id_usuario]);
                }
            }
        }

        res.send({ ok: true, message: "Chat grupal creado con éxito", id_chat });
    } catch (error) {
        res.status(500).send({ message: "Error al crear chat grupal", error: error.message });
    }
});



// HISTORIAL:
app.get("/mensajes/:id_chat", async function(req, res) {
    try {
        const { id_chat } = req.params;
        const mensajes = await realizarQuery(`
            SELECT m.id_mensaje, m.id_chat, m.id_usuario, u.nombre AS remitente, m.texto, m.hora_enviada
            FROM Mensajes m
            JOIN UsuariosWhatsapp u ON m.id_usuario = u.id_usuario
            WHERE m.id_chat = ?
            ORDER BY m.id_mensaje ASC
        `, [id_chat]);

        res.send({ ok: true, mensajes });
    } catch (error) {
        res.status(500).send({ message: "Error al obtener historial", error: error.message });
    }
});