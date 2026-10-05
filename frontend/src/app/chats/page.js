
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Popup from "reactjs-popup";

import ChatList from "@/components/ChatList";
import Input from "@/components/Input";
import Button from "@/components/Button";

import styles from "../Chats.module.css";

export default function ChatsPage() {
  const router = useRouter();

  const [idUsuario, setIdUsuario] = useState(null);
  const [chats, setChats] = useState([]);

  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [nombreGrupo, setNombreGrupo] = useState("");
  const [correosGrupo, setCorreosGrupo] = useState("");
  const [fotoGrupo, setFotoGrupo] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("id_usuario");

    if (!id) {
      router.push("/");
      return;
    }

    setIdUsuario(id);
    cargarChats(id);
  }, []);

  async function cargarChats(id) {
    try {
      const respuesta = await fetch(
        `http://localhost:4000/chats/${id}`
      );

      const data = await respuesta.json();

      if (data.ok) {
        setChats(data.chats);
      }
    } catch (error) {
      console.error("Error al cargar chats:", error);
    }
  }

  function abrirChat(idChat) {
  
    router.push(`/chats/${idChat}`);
  }

  async function crearChat() {
    setMensaje("");

    if (!correo) {
      setMensaje("Ingresá un correo.");
      return;
    }

    try {
      const respuesta = await fetch(
        "http://localhost:4000/chat/individual",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_usuario_creador: Number(idUsuario),
            correo_destinatario: correo,
          }),
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(data.message);
        return;
      }

      setCorreo("");

      await cargarChats(idUsuario);

      alert("Chat creado correctamente.");
    } catch (error) {
      console.error(error);
      setMensaje("Error al crear el chat.");
    }
  }

  async function crearGrupo() {
    setMensaje("");

    if (!nombreGrupo) {
      setMensaje("Ingresá un nombre para el grupo.");
      return;
    }

    const correos = correosGrupo
      .split(",")
      .map((correo) => correo.trim())
      .filter((correo) => correo !== "");

    try {
      const respuesta = await fetch(
        "http://localhost:4000/chat/grupal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nom_grupo: nombreGrupo,
            id_usuario_creador: Number(idUsuario),
            correos,
            foto_grupo: fotoGrupo,
          }),
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(data.message);
        return;
      }

      setNombreGrupo("");
      setCorreosGrupo("");
      setFotoGrupo("");

      await cargarChats(idUsuario);

      alert("Grupo creado correctamente.");
    } catch (error) {
      console.error(error);
      setMensaje("Error al crear el grupo.");
    }
  }

  return (
    <main className={styles.pagina}>
      <div className={styles.contenedor}>

        <div className={styles.encabezado}>
          <h1>Mis chats</h1>

          <button
            onClick={() => {
              localStorage.removeItem("id_usuario");
              router.push("/");
            }}
          >
            Cerrar sesión
          </button>
        </div>

        <div className={styles.botones}>

          <Popup
            trigger={
              <button className={styles.boton}>
                + Nuevo chat
              </button>
            }
            modal
            nested
          >
            {(close) => (
              <div className={styles.popup}>
                <h2>Nuevo chat</h2>

                <Input
                  label="Correo del usuario"
                  type="email"
                  value={correo}
                  onChange={(e) =>
                    setCorreo(e.target.value)
                  }
                  placeholder="correo@ejemplo.com"
                />

                {mensaje && (
                  <p className={styles.error}>
                    {mensaje}
                  </p>
                )}

                <Button
                  text="Crear chat"
                  type="button"
                  onClick={() => {
                    crearChat();
                    close();
                  }}
                />

                <button onClick={close}>
                  Cancelar
                </button>
              </div>
            )}
          </Popup>


          <Popup
            trigger={
              <button className={styles.boton}>
                + Nuevo grupo
              </button>
            }
            modal
            nested
          >
            {(close) => (
              <div className={styles.popup}>
                <h2>Nuevo grupo</h2>

                <Input
                  label="Nombre del grupo"
                  value={nombreGrupo}
                  onChange={(e) =>
                    setNombreGrupo(e.target.value)
                  }
                />

                <Input
                  label="Correos separados por coma"
                  value={correosGrupo}
                  onChange={(e) =>
                    setCorreosGrupo(e.target.value)
                  }
                  placeholder="a@gmail.com, b@gmail.com"
                />

                <Input
                  label="Foto del grupo"
                  value={fotoGrupo}
                  onChange={(e) =>
                    setFotoGrupo(e.target.value)
                  }
                  placeholder="URL de imagen"
                />

                {mensaje && (
                  <p className={styles.error}>
                    {mensaje}
                  </p>
                )}

                <Button
                  text="Crear grupo"
                  type="button"
                  onClick={() => {
                    crearGrupo();
                    close();
                  }}
                />

                <button onClick={close}>
                  Cancelar
                </button>
              </div>
            )}
          </Popup>

        </div>

        <ChatList
          chats={chats}
          onSeleccionarChat={abrirChat}
        />

      </div>
    </main>
  );
}