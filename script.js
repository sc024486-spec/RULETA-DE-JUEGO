const ruleta = document.querySelector(".ruleta");
const botonGirar = document.getElementById("girar");
const resultadoTexto = document.getElementById("resultado-texto");

const opciones = [
    "Premio",
    "Reto",
    "Pregunta",
    "Sorpresa",
    "Premio",
    "Reto",
    "Pregunta",
    "Sorpresa"
];

let girando = false;
let rotacion = 0;

botonGirar.addEventListener("click", function () {

    if (girando) {
        return;
    }

    girando = true;
    botonGirar.disabled = true;

    // Elegir una opción al azar
    const numero = Math.floor(Math.random() * opciones.length);

    // Cada sección mide 45 grados
    const gradosPorOpcion = 45;

    // Centro de la sección elegida
    const centro = numero * gradosPorOpcion + 22.5;

    // Posición actual de la ruleta
    const posicionActual = rotacion % 360;

    // Calcular cuánto debe girar para llevar
    // la opción elegida hasta la flecha de arriba
    let ajuste = 360 - centro - posicionActual;

    if (ajuste < 0) {
        ajuste += 360;
    }

    // 5 vueltas completas + ajuste
    const vueltas = 360 * 5;

    rotacion += vueltas + ajuste;

    // Hacer girar la ruleta
    ruleta.style.transform = `rotate(${rotacion}deg)`;

    // Esperar a que termine
    setTimeout(function () {

        resultadoTexto.textContent =
            "🎉 ¡Te salió: " + opciones[numero] + "!";

        botonGirar.disabled = false;
        girando = false;

    }, 4000);

});