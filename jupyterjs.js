"use strict";


const resaltar = (elemento) =>{
  hljs.highlightElement(elemento,{language: "javascript"});
}


const eliminarBloque = e => {
  e.target.closest("section").remove();
};


const borrarOutput = e => {
  e.target.closest("section").lastElementChild.innerHTML="";
}


/**
 * Ejecuta el código más cercano al botón y muestra los console.log() en la etiqueta output más cercana.
 * @param {HTMLButtonElement} e 
 */
function runCode(e) {
  const boton = e.target.closest("button");
  const textArea = boton.parentElement.previousElementSibling;
  const outputElement = boton.parentElement.nextElementSibling;

  // const code = textArea.value;
  const code = textArea.textContent;
  
  outputElement.innerHTML = ""; // Limpiar salida anterior

  // Almacenar la función console.log original
  const originalLog = console.log;

  // Redefinir console.log para capturar la salida en el DOM
  console.log = function (...args) {
    // Convertir argumentos a una cadena y añadir un salto de línea
    const outputText = args.map(arg => String(arg)).join(" ") + "\n";
    outputElement.textContent += outputText;
  };

  try {
    // Ejecutar el código usando new Function()
    // La función se crea sin argumentos y se llama inmediatamente
    const executableFunction = new Function(code);

    // Ejecuta la función y captura el valor de retorno (si lo hay)
    const result = executableFunction();

    // Si hay un resultado (no undefined), mostrarlo como 'Return Value'
    if (result !== undefined) {
      const resultText = `\n[Return Value]: ${String(result)}`;
      outputElement.textContent += resultText;
    }
  } catch (error) {
    // Capturar y mostrar errores de ejecución
    outputElement.textContent += `🚨 ERROR:\n${error.message}`;
    console.error(error); // También loguear en la consola del navegador
  } finally {
    // Restaurar la función console.log original
    console.log = originalLog;
  }
}




/**
 * Permite añadir un bloque de texto al cuaderno
 */
const anadirBloqueDeTexto = ()=>{
  const dialog = document.createElement("dialog");
  const p = document.createElement("p");
  p.innerText = "Escribe el texto que deseas añadir (se permite usar HTML)."

  const textarea = document.createElement("textarea");

  const form = document.createElement("form");
  form.classList.add("formBotonera", "justifyCenter");

  const buttonAceptar = document.createElement("button");
  buttonAceptar.innerText="Aceptar";
  buttonAceptar.type="button";

  buttonAceptar.addEventListener("click", e=>{
    const section = document.createElement("section");
    const divTexto = document.createElement("div");
    const divBotones = document.createElement("div");
    section.append(divTexto, divBotones);
    divTexto.innerHTML = textarea.value;
    divTexto.contentEditable = "true";

    const buttonEliminar = document.createElement("img");
    buttonEliminar.src="img/trash.svg";
    buttonEliminar.dataset.jup = "botonEliminarBloque";
    buttonEliminar.classList.add("buttonEliminarTexto");
    buttonEliminar.dataset.jup = "botonEliminarBloque";
    buttonEliminar.addEventListener("click", eliminarBloque)

    const buttonEditar = document.createElement("img");
    buttonEditar.src="img/edit.svg";
    buttonEditar.classList.add("buttonEliminarTexto");
    buttonEditar.dataset.jup = "botonEditarBloque";

    buttonEditar.addEventListener("click", ()=>{
      mostrarDialogoModificarTexto(divTexto);
    })

    divBotones.append(buttonEliminar, buttonEditar);

  
    const main = document.querySelector("main");
    const formAnadirBloques = document.querySelector("form[data-jup=formAnadirBloques]");
    main.insertBefore(section, formAnadirBloques);
    dialog.close();
    dialog.remove();
  });

  const buttonCancelar = document.createElement("button");
  buttonCancelar.innerText="Cancelar";
  buttonCancelar.type="button";

  buttonCancelar.addEventListener("click", e=>{
    dialog.close();
    dialog.remove();
  });

  //Cerramos el cuadro de diálogo con Escape y haciendo click fuera
  //Con ENTER no porque se necesita para escribir el texto
  textarea.addEventListener("keydown", e=>{
    // if(e.key=="Enter") {e.preventDefault(); buttonAceptar.click();}
    if(e.key=="Escape") buttonCancelar.click();
  });
  dialog.addEventListener("click", e=>{
  if(e.target.tagName=="DIALOG")
    dialog.remove();
  })


  form.append(buttonAceptar, buttonCancelar);

  dialog.append(p, textarea, form);
  document.body.append(dialog);
  dialog.showModal();
}


/**
 * 
 * @param {HTMLElement} divTexto 
 */
const mostrarDialogoModificarTexto=divTexto=>{
  const dialog = document.createElement("dialog");
  const p = document.createElement("p");
  p.innerText = "Modifica el contenido del bloque de texto (se permite usar HTML)."

  const textarea = document.createElement("textarea");
  textarea.value = divTexto.innerHTML;

  const form = document.createElement("form");
  form.classList.add("formBotonera", "justifyCenter");

  const buttonAceptar = document.createElement("button");
  buttonAceptar.innerText="Aceptar";
  buttonAceptar.type="button";

  buttonAceptar.addEventListener("click", e=>{
    divTexto.innerHTML = textarea.value;
    dialog.close();
    dialog.remove();
  });

  const buttonCancelar = document.createElement("button");
  buttonCancelar.innerText="Cancelar";
  buttonCancelar.type="button";

  buttonCancelar.addEventListener("click", e=>{
    dialog.close();
    dialog.remove();
  });

  //Cerramos el cuadro de diálogo con Escape y haciendo click fuera
  //Con ENTER no porque se necesita para escribir el texto
  textarea.addEventListener("keydown", e=>{
    // if(e.key=="Enter") {e.preventDefault(); buttonAceptar.click();}
    if(e.key=="Escape") buttonCancelar.click();
  });
  dialog.addEventListener("click", e=>{
  if(e.target.tagName=="DIALOG")
    dialog.remove();
  })


  form.append(buttonAceptar, buttonCancelar);

  dialog.append(p, textarea, form);
  document.body.append(dialog);
  dialog.showModal();
}





/**
 * Permite añadir un bloque de texto al cuaderno
 */
const anadirBloqueDeCodigo = ()=>{
  const dialog = document.createElement("dialog");
  const p = document.createElement("p");
  p.innerText = "Escribe el código Javascript que deseas añadir. Con Ctrl+Espacio se restaura el resaltado de sintaxis."

  const textarea = document.createElement("textarea");

  const form = document.createElement("form");
  form.classList.add("formBotonera", "justifyCenter");

  const buttonAceptar = document.createElement("button");
  buttonAceptar.innerText="Aceptar";
  buttonAceptar.type="button";

  buttonAceptar.addEventListener("click", e=>{
    const section = document.createElement("section");

    // const textAreaCodigo = document.createElement("textarea"); 
    const textAreaCodigo = document.createElement("pre");
    textAreaCodigo.textContent = textarea.value;
    textAreaCodigo.classList.add("codigo");
    textAreaCodigo.dataset.jup = "code";
    textAreaCodigo.contentEditable = "true";
    
    // const pre = document.createElement("pre");
    // pre.append(textAreaCodigo);

    const buttonPlay = document.createElement("button");  
    buttonPlay.type="button";
    const icono = document.createElement("img");
    icono.src="img/play.svg";
    buttonPlay.append(icono," Ejecutar código");
    buttonPlay.dataset.jup = "botonEjecutarCodigo";
    buttonPlay.addEventListener("click", runCode)
    
    const buttonEliminar = document.createElement("button");
    buttonEliminar.type="button";
    const iconoEliminar = document.createElement("img");
    iconoEliminar.src="img/trash.svg";
    buttonEliminar.append(iconoEliminar," Eliminar código");
    buttonEliminar.dataset.jup = "botonEliminarBloque";
    buttonEliminar.addEventListener("click", eliminarBloque);

    const buttonBorrarOutput = document.createElement("button");
    buttonBorrarOutput.type="button";
    const iconoBorrarOutput = document.createElement("img");
    iconoBorrarOutput.src="img/borrarOutput.svg";
    buttonBorrarOutput.append(iconoBorrarOutput," Borrar salida");
    buttonBorrarOutput.dataset.jup = "botonBorrarSalida";
    buttonBorrarOutput.addEventListener("click", borrarOutput);
    
    const formBotonera = document.createElement("form");
    formBotonera.append(buttonPlay, buttonEliminar, buttonBorrarOutput);
    formBotonera.classList.add("formBotonera","justifyCenter");


    const output = document.createElement("output");
    output.dataset.jup="output";

    section.append(textAreaCodigo, formBotonera,output);
    
    const main = document.querySelector("main");
    const formAnadirBloques = document.querySelector("form[data-jup=formAnadirBloques]");
    main.insertBefore(section, formAnadirBloques);
    dialog.close();
    dialog.remove();
    
    resaltar(textAreaCodigo);
    textAreaCodigo.addEventListener("keyup", e=>{
      if(e.key ==" " && e.ctrlKey)
        resaltar(textAreaCodigo)}
    );
  });

  const buttonCancelar = document.createElement("button");
  buttonCancelar.innerText="Cancelar";
  buttonCancelar.type="button";

  buttonCancelar.addEventListener("click", e=>{
    dialog.close();
    dialog.remove();
  });

  //Cerramos el cuadro de diálogo con Escape y haciendo click fuera
  //Con ENTER no porque se necesita para escribir el código
  textarea.addEventListener("keydown", e=>{
    // if(e.key=="Enter") {e.preventDefault(); buttonAceptar.click();}
    if(e.key=="Escape") buttonCancelar.click();
  });


  dialog.addEventListener("click", e=>{
  if(e.target.tagName=="DIALOG")
    dialog.remove();
  })

  form.append(buttonAceptar, buttonCancelar);

  dialog.append(p, textarea, form);
  document.body.append(dialog);
  dialog.showModal();
}


/**
 * Crea un fichero HTML con el contenido del cuaderno
 */
const guardarFichero = ()=>{

// Quitamos el liveServer si se está usando antes de guardarlo (luego lo restauramos)
let liveServer = document.querySelector("body > script:last-of-type");
if(liveServer)
  liveServer.remove();

// 1. Define el contenido y el nombre del fichero
const contenido = "<!DOCTYPE html><html>"+document.head.innerHTML +document.body.innerHTML+"</html>";
const nombreFichero = "cuaderno.html";

// 2. Crea un objeto Blob con el contenido
const blob = new Blob([contenido], { type: 'text/plain' });

// 3. Crea una URL para el Blob
const url = URL.createObjectURL(blob);

// 4. Crea un enlace '<a>' oculto y configura sus atributos
const a = document.createElement('a');
a.href = url;
a.download = nombreFichero;

// 5. Simula un clic en el enlace para iniciar la descarga
document.body.appendChild(a); // Es necesario que esté en el DOM para el clic en algunos navegadores
a.click();
document.body.removeChild(a); // Limpia el elemento

// 6. Libera el objeto URL para liberar memoria (opcional pero recomendado)
URL.revokeObjectURL(url);

console.log(`El fichero "${nombreFichero}" con el contenido "${contenido}" se ha generado y descargado.`);

// Restauramos el liveServer si se estaba usando antes de guardarlo
if(liveServer)
  document.body.append(liveServer);
}

////////////////
// MAIN
////////////////

document.querySelector("[data-jup=btnAnadirTexto]").addEventListener("click", anadirBloqueDeTexto);

document.querySelector("[data-jup=btnAnadirCodigo]").addEventListener("click", anadirBloqueDeCodigo);

document.querySelector("[data-jup=btnGuardarFichero]").addEventListener("click", guardarFichero);




/* Restauramos los eventListeners de los bloques de código y texto si existe alguno (si este es un documento generado) */
//Restauramos los botones de eliminar bloques de texto y código
document.querySelectorAll("[data-jup=botonEliminarBloque]").forEach(b=>{
  b.addEventListener("click", eliminarBloque);
})

// Restauramos los botones de editar bloque de texto
document.querySelectorAll("[data-jup=botonEditarBloque]").forEach(b=>{
  b.addEventListener("click", (e)=>{
    mostrarDialogoModificarTexto(e.target.closest("section").firstElementChild);
  });
})

// Restauramos el botón de ejecutar código
document.querySelectorAll("[data-jup=botonEjecutarCodigo]").forEach(b=>{
  b.addEventListener("click", runCode);
})

// Restauramos el botón de borrar output
document.querySelectorAll("[data-jup=botonBorrarSalida]").forEach(b=>{
  b.addEventListener("click", borrarOutput);
})
  



