"use client"
import styles from "./NotaItem.module.css"
export default function NotaItem({nota, indice, onEliminar}){
    return(
        <>
            <li className={styles.item}>
                <p className={styles.nota}> Nota N°{indice + 1}: {nota}</p>
                
            {nota >=6 ?(
                <p className={styles.aprueba}>¡Aprobaste!</p>
            ) : (
                <p className={styles.noAprueba}>No aprobaste</p>
            )}

            <button className={styles.button} onClick={()=>onEliminar(indice)}>Eliminar</button>
           </li>
        </>
    );

}