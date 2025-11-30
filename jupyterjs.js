"use strict";

//FIXME: Terminar las view transitions para agregar bloques

const CONTENIDOPROTEGIDO = 1;
const BOTONESOCULTOS = 2;


/**
 * Recupera el valor de un atributo data-x del body (o false si no está establecido)
 * @param {number} atributo 
 * @returns el valor que corresponde al atributo que se pasa como parámetro
 */
const getValorAtributo = atributo =>{
  if(atributo == CONTENIDOPROTEGIDO){
    if( document.body.dataset.contenidoprotegido == undefined || document.body.dataset.contenidoprotegido == "false")
      return false;
    return true;
  }
  else{ // botones ocultos
    if( document.body.dataset.botonesocultos == undefined || document.body.dataset.botonesocultos == "false")
      return false;
    return true;
  }
}


/**
 * Establece en un atributo data-x del body el valor que se pasa como parámetro
 * @param {number} atributo 
 * @param {boolean} valor 
 */
const setValorAtributo = (atributo, valor) =>{
  if(atributo == CONTENIDOPROTEGIDO){
    document.body.dataset.contenidoprotegido = valor;
  }
  else{ // botones ocultos
    document.body.dataset.botonesocultos = valor;
  }
}



const resaltar = (elemento) =>{
  hljs.highlightElement(elemento,{language: "javascript"});
}


const eliminarBloque = e => {
  document.startViewTransition(()=>{
    e.target.closest("section").remove();
  });
};


const borrarOutput = e => {
  document.startViewTransition(()=>{
    e.target.closest("section").lastElementChild.innerHTML="";
  });
}


const subirBloque = e => {
  const sectionActual = e.target.closest("section");
  const sectionAnterior = sectionActual.previousElementSibling;

  if(sectionAnterior){
    document.startViewTransition(()=>{
      sectionAnterior.before(sectionActual);
    });
  }
};

const bajarBloque = e => {
  const sectionActual = e.target.closest("section");
  const sectionSiguiente = sectionActual.nextElementSibling;

  if(sectionSiguiente.tagName != "FORM"){
    document.startViewTransition(()=>{
      sectionSiguiente.after(sectionActual);
    });
  }
};


/**
 * Ejecuta el código más cercano al botón y muestra los console.log() en la etiqueta output más cercana.
 * @param {HTMLButtonElement} e 
 */
function runCode(e) {
  const boton = e.target.closest("img");
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

  const imgAceptar = document.createElement("img");
  imgAceptar.src="img/square-check.svg";

  const buttonAceptar = document.createElement("button");
  buttonAceptar.innerText="Aceptar";
  buttonAceptar.prepend(imgAceptar);
  buttonAceptar.type="button";

  buttonAceptar.addEventListener("click", e=>{
    const section = document.createElement("section");
    const divTexto = document.createElement("div");
    const divBotones = document.createElement("div");
    section.append(divTexto, divBotones);
    divTexto.innerHTML = textarea.value;

    if( ! getValorAtributo(CONTENIDOPROTEGIDO) ){
      divTexto.contentEditable = "true";
    }
    else{
      divTexto.contentEditable = "false";
    }

    if( getValorAtributo(BOTONESOCULTOS) ){
      divBotones.style.display="none";
    }

    const buttonEliminar = document.createElement("img");
    buttonEliminar.src="img/trash.svg";
    buttonEliminar.dataset.jup = "botonEliminarBloque";
    buttonEliminar.classList.add("buttonEliminarTexto");
    buttonEliminar.addEventListener("click", eliminarBloque)

    const buttonEditar = document.createElement("img");
    buttonEditar.src="img/edit.svg";
    buttonEditar.classList.add("buttonEliminarTexto");
    buttonEditar.dataset.jup = "botonEditarBloque";
    
    buttonEditar.addEventListener("click", ()=>{
      mostrarDialogoModificarTexto(divTexto);
    })


    const buttonSubir = document.createElement("img");
    buttonSubir.src="img/caret-up.svg";
    buttonSubir.classList.add("buttonEliminarTexto");
    buttonSubir.dataset.jup = "botonSubirBloque";
    buttonSubir.addEventListener("click",subirBloque);

    const buttonBajar = document.createElement("img");
    buttonBajar.src="img/caret-down.svg";
    buttonBajar.classList.add("buttonEliminarTexto");
    buttonBajar.dataset.jup = "botonBajarBloque";
    buttonBajar.addEventListener("click",bajarBloque);


    divBotones.append(buttonEliminar, buttonEditar, buttonSubir, buttonBajar);

  
    const main = document.querySelector("main");
    const formAnadirBloques = document.querySelector("form[data-jup=formAnadirBloques]");
    main.insertBefore(section, formAnadirBloques);
    dialog.close();
    dialog.remove();
  });

  const imgCancelar = document.createElement("img");
  imgCancelar.src="img/square-x.svg";

  const buttonCancelar = document.createElement("button");
  buttonCancelar.innerText="Cancelar";
  buttonCancelar.prepend(imgCancelar);
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
  p.innerText = "Escribe el código Javascript que deseas añadir. Con Ctrl+Espacio se restaurará el resaltado de sintaxis."

  const textarea = document.createElement("textarea");
  textarea.spellcheck = false;

  const form = document.createElement("form");
  form.classList.add("formBotonera", "justifyCenter");
  
  const imgAceptar = document.createElement("img");
  imgAceptar.src="img/square-check.svg";

  const buttonAceptar = document.createElement("button");
  buttonAceptar.innerText="Aceptar";
  buttonAceptar.prepend(imgAceptar);
  buttonAceptar.type="button";

  buttonAceptar.addEventListener("click", e=>{
    const section = document.createElement("section");

    // const textAreaCodigo = document.createElement("textarea"); 
    const textAreaCodigo = document.createElement("pre");
    textAreaCodigo.textContent = textarea.value;
    textAreaCodigo.classList.add("codigo");
    textAreaCodigo.dataset.jup = "code";
    textAreaCodigo.contentEditable = "true";
    textAreaCodigo.classList.add("language-javascript");
    textAreaCodigo.spellcheck=false;
    
    const divBotones = document.createElement("div");

    const buttonEliminar = document.createElement("img");
    buttonEliminar.src="img/trash.svg";
    buttonEliminar.dataset.jup = "botonEliminarBloque";
    buttonEliminar.classList.add("buttonEliminarTexto");
    buttonEliminar.addEventListener("click", eliminarBloque)

    const buttonPlay = document.createElement("img");
    buttonPlay.src="img/play.svg";
    buttonPlay.dataset.jup = "botonEjecutarCodigo";
    buttonPlay.classList.add("buttonEliminarTexto");
    buttonPlay.addEventListener("click", runCode);
    
    const buttonBorrarOutput = document.createElement("img");
    buttonBorrarOutput.src="img/borrarOutput.svg";
    buttonBorrarOutput.dataset.jup = "botonBorrarSalida";
    buttonBorrarOutput.classList.add("buttonEliminarTexto");
    buttonBorrarOutput.addEventListener("click", borrarOutput);

    const buttonSubir = document.createElement("img");
    buttonSubir.src="img/caret-up.svg";
    buttonSubir.classList.add("buttonEliminarTexto");
    buttonSubir.dataset.jup = "botonSubirBloque";
    buttonSubir.addEventListener("click",subirBloque);

    const buttonBajar = document.createElement("img");
    buttonBajar.src="img/caret-down.svg";
    buttonBajar.classList.add("buttonEliminarTexto");
    buttonBajar.dataset.jup = "botonBajarBloque";
    buttonBajar.addEventListener("click",bajarBloque);

    if( getValorAtributo(BOTONESOCULTOS) ){
      buttonEliminar.style.display="none";
      buttonSubir.style.display="none";
      buttonBajar.style.display="none";
    }


    divBotones.append(buttonEliminar, buttonPlay,buttonBorrarOutput, buttonSubir, buttonBajar);

    /*
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

    */
    const output = document.createElement("output");
    output.dataset.jup="output";

    section.append(textAreaCodigo, divBotones,output);
    
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

  const imgCancelar = document.createElement("img");
  imgCancelar.src="img/square-x.svg";

  const buttonCancelar = document.createElement("button");
  buttonCancelar.innerText="Cancelar";
  buttonCancelar.prepend(imgCancelar);
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
  
//Restauramos los botones de subir y bajar bloques de texto y código
document.querySelectorAll("[data-jup=botonSubirBloque]").forEach(b=>{
  b.addEventListener("click", subirBloque);
})

document.querySelectorAll("[data-jup=botonBajarBloque]").forEach(b=>{
  b.addEventListener("click", bajarBloque);
})

// Restauramos el resaltado del código
document.querySelectorAll("[data-jup=code]").forEach(textarea=>{
  textarea.addEventListener("keyup", e=>{
    if(e.key ==" " && e.ctrlKey)
      resaltar(textarea)}
  );
  textarea.spellcheck=false;
  console.log(textarea)
})

/* Menú auxiliar */
let jupTema=0;
document.querySelector("#btnCambiarTema").addEventListener("click", e=>{
  
  if(jupTema==0){
    jupTema++;
    document.body.classList.remove("rojo");
    document.body.classList.remove("verde");
    document.body.classList.add("dark");
  }
  else if(jupTema==1){
    jupTema++;
    document.body.classList.add("rojo");
    document.body.classList.remove("verde");
    document.body.classList.remove("dark");
  }
  else if(jupTema==2){
    jupTema++;
    document.body.classList.remove("rojo");
    document.body.classList.add("verde");
    document.body.classList.remove("dark");
  }
  else{
    jupTema=0;
    document.body.classList.remove("rojo");
    document.body.classList.remove("verde");
    document.body.classList.remove("dark");
  }
});

document.querySelector("#btnPosiciónBotones").addEventListener("click", e=>{
  document.body.classList.toggle("botones-izquierda");
});



document.querySelector("#btnProtegerContenido").addEventListener("click", e=>{
  // debugger
  if( ! getValorAtributo(CONTENIDOPROTEGIDO) ){
    document.querySelectorAll("div[contenteditable=true]").forEach(d=>{
      d.contentEditable = false;
    });

    setValorAtributo(CONTENIDOPROTEGIDO, true);
  }
  else{
    document.querySelectorAll("div[contenteditable=false]").forEach(d=>{
      d.contentEditable = true;
    });

    setValorAtributo(CONTENIDOPROTEGIDO, false);
  }
});


document.querySelector("#btnVerOcultarBotones").addEventListener("click", e=>{
  if( ! getValorAtributo(BOTONESOCULTOS) ){
    //Ocultamos todos los botones del bloque de texto
    document.querySelectorAll("section div[contenteditable] + div:nth-child(2)").forEach(b=>b.style.display="none");
    
    //Del bloque de código ocultamos todos menos el de ejecutar y limpiar la salida
    document.querySelectorAll("[data-jup=botonEliminarBloque],[data-jup=botonSubirBloque],[data-jup=botonBajarBloque]").forEach(b=>b.style.display="none");

    setValorAtributo(BOTONESOCULTOS, true);
  }
  else{
    //Mostramos todos los botones del bloque de texto
    document.querySelectorAll("section div[contenteditable] + div:nth-child(2)").forEach(b=>b.style.display="");
    
    //Del bloque de código mostramos los botones ocultos
    document.querySelectorAll("[data-jup=botonEliminarBloque],[data-jup=botonSubirBloque],[data-jup=botonBajarBloque]").forEach(b=>b.style.display="");

    setValorAtributo(BOTONESOCULTOS, false);
  }
});