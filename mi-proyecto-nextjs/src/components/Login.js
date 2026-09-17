
"use client";

import { useState, useEffect } from "react";

export default function Login() {
  const [correo, setEmail] = useState("");
  const [contraseña, setPassword] = useState("");
  const [usuarios, setUsuarios] = useState([]); //guardar los usuarios que vienen del backend

  // Cargar los usuarios ni bien abrimos la pagina
  useEffect(() => {
    fetch("http://localhost:4000/login")
      .then((response) => response.json())
      .then((data) => {
        setUsuarios(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  function iniciarSesion() {
    const usuarioEncontrado = usuarios.find(
      (usuario) =>
        usuario.correo === correo &&
        usuario.contraseña === contraseña
    );

    if (usuarioEncontrado) {
      alert("Inicio de sesión correcto");
    } else {
      alert("Email o contraseña incorrectos");
    }
  }

  return (
    <div>
      <h1>Iniciar sesión</h1>

      <input
        type="email"
        placeholder="Email"
        value={correo}
        onChange={(event) => setEmail(event.target.value)}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={contraseña}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button onClick={iniciarSesion}>
        Iniciar sesión
      </button>
    </div>
  );
}

