"use client"
import {useState} from "react";
import styles from"./NotaInput.module.css";

export default function NotaInput({onAgregar}){
    const [nota,setNota] = useState("");

    const handleChange = (event) =>{
        console.log("Tipo de evento: ",event.type);
        console.log("Elemento completo:", event.target);

        setNota(event.target.value);

    }

    const notaInvalida = nota === "" || Number(nota) < 0 || Number(nota) > 10;

    const handleAgregar =()=>{
        onAgregar(Number(nota));
        setNota("");
    }
    return(
        <>
            <div className={styles.contenedorInput}>
                <input className={styles.input} type="number" onChange={handleChange} placeholder="Escriba la nota.."value={nota}min={"0"}max={"10"}></input>
                <button className={styles.boton} onClick={handleAgregar} disabled={notaInvalida}> Agregar Nota</button>
                {notaInvalida&&(
                    <p className={styles.error}>Ingresá una nota entre 0 y 10.</p>
                )}
            </div>
            

        </>

    )
}