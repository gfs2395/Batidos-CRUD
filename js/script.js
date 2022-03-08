//Resta controlar algunas frutas de los JSON, como perita, algunas tildes y demas

const cargarFrutasLocal = fetch("./js/frutas.json")
  .then((response) => response.text())
  .then((data) => (frutasJSON = data));

const apiBatidos =
  "http://20.123.169.43:8080/BatidosRestAuto-1.0-SNAPSHOT/api/batidos/";

let arrayFrutas = null; //Si declaro aqui el array que posteriormente contendra frutas, me evito tener que hacer foreachs innecesarios.

const DOM = {
  botonBusqueda: document.getElementById("botonBusqueda"),
  inputBusqueda: document.getElementById("textoBusqueda"),
  divDescripcion: document.getElementById("descripcion"),
  divFrutas: document.getElementById("frutas"),
  contenedoresFrutas: "",
};

(function () {
  DOM.botonBusqueda.addEventListener("click", function () {
    fetch(apiBatidos)
      .then((response) => {
        reiniciarInterfaz();
        cargarEsperaResponse();
        return response.json();
      })
      .then((data) => {
        // Aqui trabajo con el json devuelto
        //cargarEsperaData(buscarBatido(data).frutas); //Investigar el porque de que me deje acceder directamente a la propiedad que me devuelve el return
        let batidoBusqueda = buscarBatido(data);
        console.log(batidoBusqueda);
        if (batidoBusqueda == undefined) {
          finalizarEspera(DOM.divFrutas);
          finalizarEspera(DOM.divDescripcion);
          DOM.divFrutas.appendChild(generarError("No existe su ID de batido"));
          throw Error(response.statusText);
        }
        cargarEsperaData(batidoBusqueda.frutas);
        cargarDescripcion(
          `Batido de ${transformarArrayFrutas(batidoBusqueda.frutas)} con ${
            batidoBusqueda.extras
          }`
        );
        cargarFrutas();
      })
      .catch((err) => {
        // Errores del fetch
        DOM.divFrutas.appendChild(generarError("ERROR"));

        //DOM.divFrutas.appendChild(generarError(err))
      });
  });

  cargarFrutasLocal;
})();

function cargarEsperaResponse() {
  DOM.divDescripcion.classList.add("esperando");
  DOM.divFrutas.classList.add("esperando");
}

function cargarEsperaData(frutas) {
  arrayFrutas = transformarArrayFrutas(frutas);
  arrayFrutas.forEach(() => {
    //Ya que solo lo uso para pintar los mismos divs que frutas haya, no lo necesito
    DOM.divFrutas.appendChild(pintarDivEnEspera());
  });
}

function transformarArrayFrutas(pArray) {
  //Las frutas vienen en un string, las despedazo con split
  //Metodo para eliminar corchetes, siempre presentes al principio y al final
  let arrayDescompuesto = pArray.split(",");
  arrayDescompuesto[0] = arrayDescompuesto[0].substring(1); //PRIMER CORCHETE
  arrayDescompuesto[arrayDescompuesto.length - 1] = arrayDescompuesto[
    arrayDescompuesto.length - 1
  ].substring(0, arrayDescompuesto[arrayDescompuesto.length - 1].length - 1); //ULTIMO CORCHETE
  let arrayFinal = arrayDescompuesto.map(function (elementoArray) {
    //Metodo para liminar espacios en blanco usando el map
    return elementoArray.split(" ").join(""); //Con split separo cada elemento string del array por sus espacios, para luego unirlos con el join sin ellos
  });
  return arrayFinal;
}

function buscarBatido(pData) {
  return pData.find((batido) => batido.idBatido == DOM.inputBusqueda.value);
}
function buscarFruta(pData, pFrutaBuscada) {
  return JSON.parse(pData).find((fruta) => fruta.nombre == pFrutaBuscada);
}

function cargarDescripcion(pDescripcion) {
  DOM.divDescripcion.textContent = pDescripcion;
}

function cargarFrutas() {
  //arrayFruyas ya cargado en la fase del estado anterior con un array limpio de frutas
  arrayFrutas.forEach((fruta) => {
    let fuenteImagen = buscarFruta(frutasJSON, fruta);
    if (fuenteImagen != undefined) {
      fetch(fuenteImagen.IMGsrc)
        .then((response) => response.blob())
        .then(createaImgFromBlob)
        .then(cargarFruta);

      //cargarFruta(fruta);
    } else {
      DOM.divFrutas.appendChild(generarError("ERROR"));
      DOM.divFrutas.appendChild(
        generarError(
          "No se ha podido cargar su fruta.Tal vez se deba a incomparibilidades del servidor con alguna fruta."
        )
      );
    }
  });
}

const createaImgFromBlob = (blob) => {
  const img = new Image();
  img.src = URL.createObjectURL(blob);
  return img;
};

function cargarFruta(pFruta) {
  //Mi proposito es eliminar la clase de esperando y, cada vez que cargarFrutas llame a cargarfruta , el .length se actualiza
  //con los nodos restantes cada vez que reasigno la variable contenedoresFrutas del DOM
  DOM.contenedoresFrutas = document.getElementsByClassName("esperando");
  //let imgFruta = document.createElement("img");
  //let datosLocalesFruta = frutasJSON.find(fruta=> fruta.nombre == pFruta);
  //img.setAttribute("src", pFruta.IMGsrc);
  DOM.contenedoresFrutas[0].classList.remove("esperando");
  DOM.contenedoresFrutas[0].appendChild(pFruta);
}

function finalizarEspera(pNodo) {
  //Funcion que me facilita quitar los estados de espera segun el momento
  pNodo.classList.remove("esperando");
}

function pintarDivEnEspera() {
  finalizarEspera(DOM.divFrutas); //Elimino la clase esperando al contenedor de estos divs
  let div = document.createElement("div");
  div.classList.add("esperando");
  div.classList.add("divFruta");
  return div;
}

function generarError(pMensaje) {
  let errorDiv = document.createElement("div");
  let p = document.createElement("p");
  p.appendChild(document.createTextNode(pMensaje));
  p.classList.add("error");
  console.log(pMensaje);
  errorDiv.appendChild(p);
  return errorDiv;
}

function reiniciarInterfaz() {
  //Metodo pendiente de mejorar, investigar como itera el foreach los childnodes, ya que con HTMLCollection si lo itera al completo
  if (DOM.divFrutas.childNodes.length >= 1) {
    //ANTIGUO METODO
    /*for(const hijoDiv of DOM.divFrutas.childNodes){ //Array from es un metodo similar
      console.log(hijoDiv.firstChild)
      DOM.divFrutas.removeChild(hijoDiv);     
    }
    DOM.divFrutas.removeChild(DOM.divFrutas.firstChild)*/
    DOM.divFrutas.childNodes.forEach(function (hijoDiv) {
      DOM.divFrutas.removeChild(hijoDiv);
    });
    if (document.getElementsByClassName("error").length == 1) {
      DOM.divFrutas.removeChild(
        document.getElementsByClassName("error")[0].parentNode
      );
    } //Se hace fuera del bucle foreach porque me deja un ultimo elemento sin borrar, averiguar porque*/
    if (DOM.divFrutas.childNodes.length > 0) {
      //Para batidos de solo una fruta
      DOM.divFrutas.removeChild(DOM.divFrutas.childNodes[0]);
    }
  }
}
