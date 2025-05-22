const API_CANDIDATOS_URL = "https://raw.githubusercontent.com/CesarMCuellarCha/Elecciones/refs/heads/main/candidatos.json";
const API_ADMIN_URL = "https://raw.githubusercontent.com/CesarMCuellarCha/Elecciones/refs/heads/main/administrador.json";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "adso";
        
let votos = {};
let eleccionesActivas = false; // Bandera que indica si las elecciones están activas o no
let nombresCandidatos = {};

/**
 * Carga los candidatos desde una API pública y los muestra en pantalla.
 * @async
 * @function cargarCandidatos
 * @returns {Promise<void>}
 */
async function cargarCandidatos() { 
    const res = await fetch(API_CANDIDATOS_URL); // Se obtiene el archivo JSON
    const candidatos = await res.json(); // Se transforma la respuesta a objeto JS

    const contenedor = document.getElementById("contenedor-candidatos"); // Contenedor HTML donde se mostrarán
    contenedor.innerHTML = ""; // Se limpia el contenedor

    candidatos.forEach((c, index) => {
        const id = `${c.nombre}-${c.apellido}-${index}`; // se crea id unico
        votos[id] = 0; //// Inicializa el contador de votos y guarda el nombre completo
        nombresCandidatos[id] = `${c.nombre} ${c.apellido}`; // Guardamos nombre completo

        const div = document.createElement("div"); //el div que representará visualmente al candidato
        div.className = "candidato"; // Se le asigna una clase para estilos
        div.innerHTML = `
      <strong>${c.nombre} ${c.apellido}</strong><br>
      ${c.curso}<br><br>
      <img src="${c.foto}" alt="${c.nombre}" data-id="${id}"><br><br>
      ${c.ficha ? `Aprendiz: ${c.nombre} ${c.apellido}<br>Ficha: ${c.ficha}` : ""}
    `;

        div.querySelector("img").addEventListener("click", () => votar(id, `${c.nombre} ${c.apellido}`)); // Se asigna el evento de clic a la imagen para registrar el voto
        contenedor.appendChild(div); // Se agrega el div al contenedor
    });

}

/**
 * Registra el voto para un candidato específico.
 * @function votar
 * @param {number} candidatoId - ID del candidato.
 * @param {string} candidatoNombre - Nombre del candidato.
 */
function votar(idCandidato, nombreCompleto) {
    if (!eleccionesActivas) {
        alert("Las elecciones aún no han sido iniciadas.");
        return; // No se permite votar si no han iniciado
    }

    const confirmacion = confirm(`¿Estás seguro de votar por ${nombreCompleto}?`);
    if (confirmacion) {
        votos[idCandidato]++; //va contando
        alert(`¡Tu voto por ${nombreCompleto} ha sido registrado!`);
        console.log("Votos actuales:", votos); // Se muestra el estado actual en consola
    }
}

async function validarAdministrador(accion) { // Función para validar las credenciales del administrador y realizar acciones según la solicitud
    const usuario = prompt("Ingrese usuario administrador:");
    const clave = prompt("Ingrese clave:");

    const res = await fetch(API_ADMIN_URL); // Se consulta la API de administrador
    const admin = await res.json();

    if (usuario === admin.username && clave === admin.password) { //validar credeniales
        if (accion === "iniciar") {
            eleccionesActivas = true;
            alert("✅ Elecciones iniciadas con éxito.");
        } else if (accion === "cerrar") {
            eleccionesActivas = false;
            alert("✅ Elecciones cerradas.");
            mostrarResultados();
        }
    } else {
        alert("❌ Usuario o clave incorrectos.");
    }
}
/**
 * Muestra los resultados de la votación actual.
 *
 * @function mostrarResultados
 */
function mostrarResultados() {
    const resultado = document.getElementById("resultado");
    const resultadoDiv = document.getElementById("resultadoCandidatos");

    resultado.classList.remove("oculto");
    resultadoDiv.innerHTML = "<h3>Resultados:</h3>";

    let resumenTexto = "📊 Resultados de la votación:\n\n";
    let maxVotos = 0;
    let ganadores = [];

    for (const id in votos) {  // Se Recorre todos los candidatos para mostrar sus votos y determinar el ganador
        const nombre = nombresCandidatos[id];
        const cantidad = votos[id];

        resultadoDiv.innerHTML += `<div>${nombre}: ${cantidad} voto(s)</div>`;
        resumenTexto += `${nombre}: ${cantidad} voto(s)\n`;

        if (cantidad > maxVotos) {
            maxVotos = cantidad;
            ganadores = [id];
        } else if (cantidad === maxVotos) {
            ganadores.push(id);
        }
    }

    resumenTexto += "\n";

    if (ganadores.length === 1) {
        const nombreGanador = nombresCandidatos[ganadores[0]];
        resultadoDiv.innerHTML += `<div><strong>🏆 Ganador: ${nombreGanador} con ${maxVotos} voto(s).</strong></div>`;
        resumenTexto += `🏆 Ganador: ${nombreGanador} con ${maxVotos} voto(s).`;
    } else {
        const nombresEmpatados = ganadores.map(id => nombresCandidatos[id]).join(", ");
        resultadoDiv.innerHTML += `<div><strong>🤝 Empate entre: ${nombresEmpatados} con ${maxVotos} voto(s).</strong></div>`;
        resumenTexto += `🤝 Empate entre: ${nombresEmpatados} con ${maxVotos} voto(s).`;
    }

    // Mostrar ventana emergente con resumen
    alert(resumenTexto);
}



// Event Listeners
document.getElementById("btnIniciar").addEventListener("click", () => validarAdministrador("iniciar"));
document.getElementById("btnCerrar").addEventListener("click", () => validarAdministrador("cerrar"));

cargarCandidatos();
