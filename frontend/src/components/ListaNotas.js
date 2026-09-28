"use client"
import NotaInput from "./NotaInput"
import NotaItem from "./NotaItem"
import styles from "./ListaNotas.module.css"

export default function ListaNotas({notas, onAgregar, onEliminar}){
    const items = [];
    for (let i = 0; i < notas.length; i++) {
        items.push(<NotaItem key={i} nota={notas[i]} indice={i} onEliminar={onEliminar} />);
    }  // <-- esta llave cierra el FOR

    // calcular promedio
    let suma=0;
    notas.forEach((nota) =>{
        suma += nota;
    });

    let promedio = 0;

    if(notas.length > 0){
        promedio = suma / notas.length;
    }

    return(
        <div className={styles.lista}>
            <NotaInput onAgregar={onAgregar}/>

            <p className={styles.promedio}>Promedio:{promedio.toFixed(2)}</p>
            {notas.length === 0 ? (
                <p className={styles.vacio}>No hay notas cargadas</p>
            ) : (
                <ul className={styles.items}>{items}</ul>
            )}
        </div>
    );
} 