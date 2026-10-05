"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useSocket } from "@/hooks/useSocket";
import Message from "@/components/Message";
import Button from "@/components/Button";
import styles from "../../Chats.module.css";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();

  const { socket, isConnected } = useSocket();

  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const [idUsuario, setIdUsuario] = useState(null);

  const idChat = params.id;

  useEffect(() => {
    const id = localStorage.getItem("id_usuario");

    if (!id) {
      router.push("/");
      return;
    }

    setIdUsuario(Number(id));
  }, []);

  // CARGAR HISTORIAL
  useEffect(() => {
    if (!idChat) return;

    async function cargarHistorial() {
      try {
        const respuesta = await fetch(
          `http://localhost:4000/mensajes/${idChat}`
        );

        const data = await respuesta.json();

        if (data.ok) {
          setMensajes(data.mensajes);
        }
      } catch (error) {
        console.error(
          "Error al cargar historial:",
          error
        );
      }
    }

    cargarHistorial();
  }, [idChat]);

  // SOCKET
  useEffect(() => {
    if (!socket || !idChat) return;

    socket.emit("joinRoom", {
      room: idChat,
    });

    function recibirMensaje(data) {
      console.log("Mensaje recibido:", data);

      setMensajes((prev) => [
        ...prev,
        {
          id_mensaje:
            Date.now(),
          id_chat: idChat,
          id_usuario: data.id_usuario,
          texto: data.message,
          remitente:
            data.id_usuario === idUsuario
              ? "Yo"
              : "Usuario",
        },
      ]);
    }

    socket.on(
      "newMessage",
      recibirMensaje
    );

    return () => {
      socket.off(
        "newMessage",
        recibirMensaje
      );
    };
  }, [socket, idChat, idUsuario]);

  function enviarMensaje() {
    if (!socket || !texto.trim()) {
      return;
    }

    socket.emit("sendMessage", {
      id_chat: Number(idChat),
      id_usuario: idUsuario,
      message: texto,
    });

    setTexto("");
  }

  function manejarEnter(e) {
    if (e.key === "Enter") {
      enviarMensaje();
    }
  }

  return (
    <main className={styles.pagina}>

      <div className={styles.chat}>

        <div className={styles.encabezado}>
          <button
            onClick={() =>
              router.push("/chats")
            }
          >
            ← Volver
          </button>

          <h1>Chat #{idChat}</h1>

          <span>
            {isConnected
              ? "🟢 Conectado"
              : "🔴 Desconectado"}
          </span>
        </div>


        <div className={styles.mensajes}>

          {mensajes.map((mensaje) => (
            <Message
              key={mensaje.id_mensaje}
              texto={mensaje.texto}
              remitente={mensaje.remitente}
              propio={
                Number(mensaje.id_usuario) ===
                Number(idUsuario)
              }
            />
          ))}

        </div>


        <div className={styles.inputMensaje}>

          <input
            value={texto}
            onChange={(e) =>
              setTexto(e.target.value)
            }
            onKeyDown={manejarEnter}
            placeholder="Escribí un mensaje..."
          />

          <Button
            text="Enviar"
            type="button"
            onClick={enviarMensaje}
          />

        </div>

      </div>

    </main>
  );
}