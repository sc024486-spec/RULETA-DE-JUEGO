const ruleta = document.querySelector(".ruleta");
const resultadoTexto = document.getElementById("resultado-texto");


// ==================================================
// OPCIONES
// ==================================================

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


// ==================================================
// VARIABLES DE LA RULETA
// ==================================================

let rotacion = 0;

let arrastrando = false;

let ultimoX = 0;
let ultimoY = 0;

let velocidad = 0;

let animacion = null;


// ==================================================
// SONIDO CLAC
// ==================================================

let audioContext = null;

const gradosSegmento = 45;

// Segmento anterior
let ultimoSegmento = 0;


// ==================================================
// CREAR SONIDO
// ==================================================

function sonidoClac() {

    if (!audioContext) {

        audioContext =
            new (window.AudioContext ||
                window.webkitAudioContext)();
    }


    if (audioContext.state === "suspended") {

        audioContext.resume();

    }


    const ahora =
        audioContext.currentTime;


    const oscilador =
        audioContext.createOscillator();


    const ganancia =
        audioContext.createGain();


    // Sonido tipo CLAC
    oscilador.type = "square";


    oscilador.frequency.setValueAtTime(
        1200,
        ahora
    );


    oscilador.frequency.exponentialRampToValueAtTime(
        500,
        ahora + 0.04
    );


    ganancia.gain.setValueAtTime(
        0.18,
        ahora
    );


    ganancia.gain.exponentialRampToValueAtTime(
        0.001,
        ahora + 0.05
    );


    oscilador.connect(ganancia);

    ganancia.connect(
        audioContext.destination
    );


    oscilador.start(ahora);

    oscilador.stop(
        ahora + 0.05
    );
}


// ==================================================
// COMPROBAR SI PASÓ UN SEGMENTO
// ==================================================

function comprobarClac() {

    const segmentoActual =
        Math.floor(
            Math.abs(rotacion) /
            gradosSegmento
        );


    if (
        segmentoActual !==
        ultimoSegmento
    ) {

        sonidoClac();

        ultimoSegmento =
            segmentoActual;
    }
}


// ==================================================
// INICIO DEL ARRASTRE
// ==================================================

ruleta.addEventListener(
    "pointerdown",
    function (e) {

        e.preventDefault();


        // Activar audio después de interacción
        if (!audioContext) {

            audioContext =
                new (window.AudioContext ||
                    window.webkitAudioContext)();

        }


        if (audioContext.state === "suspended") {

            audioContext.resume();

        }


        // Detener inercia anterior
        cancelAnimationFrame(animacion);


        arrastrando = true;

        velocidad = 0;


        ultimoX = e.clientX;

        ultimoY = e.clientY;


        // Capturar el dedo / mouse
        ruleta.setPointerCapture(
            e.pointerId
        );


        ruleta.style.cursor =
            "grabbing";
    }
);


// ==================================================
// MOVER LA RULETA
// ==================================================

ruleta.addEventListener(
    "pointermove",
    function (e) {

        if (!arrastrando) return;


        e.preventDefault();


        const rect =
            ruleta.getBoundingClientRect();


        const centroX =
            rect.left +
            rect.width / 2;


        const centroY =
            rect.top +
            rect.height / 2;


        // Posición anterior
        const x1 =
            ultimoX - centroX;

        const y1 =
            ultimoY - centroY;


        // Posición actual
        const x2 =
            e.clientX - centroX;

        const y2 =
            e.clientY - centroY;


        // Ángulo anterior
        let angulo1 =
            Math.atan2(y1, x1);


        // Ángulo actual
        let angulo2 =
            Math.atan2(y2, x2);


        // Diferencia
        let diferencia =
            angulo2 - angulo1;


        // Corregir salto
        if (diferencia > Math.PI) {

            diferencia -=
                Math.PI * 2;
        }


        if (diferencia < -Math.PI) {

            diferencia +=
                Math.PI * 2;
        }


        // Convertir a grados
        const grados =
            diferencia *
            180 /
            Math.PI;


        // Girar
        rotacion += grados;


        ruleta.style.transform =
            `rotate(${rotacion}deg)`;


        // ==========================================
        // SONIDO
        // ==========================================

        comprobarClac();


        // ==========================================
        // VELOCIDAD
        // ==========================================

        velocidad = grados;


        ultimoX = e.clientX;

        ultimoY = e.clientY;

    }
);


// ==================================================
// SOLTAR RULETA
// ==================================================

ruleta.addEventListener(
    "pointerup",
    function (e) {

        if (!arrastrando) return;


        arrastrando = false;


        try {

            ruleta.releasePointerCapture(
                e.pointerId
            );

        } catch (error) {

            // No hacer nada

        }


        ruleta.style.cursor =
            "grab";


        // ==========================================
        // IMPULSO
        // ==========================================

        let impulso =
            velocidad * 1.8;


        // Limitar velocidad
        if (impulso > 20) {

            impulso = 20;

        }


        if (impulso < -20) {

            impulso = -20;

        }


        // Si casi no se movió
        if (Math.abs(impulso) < 0.2) {

            mostrarResultado();

            return;

        }


        iniciarInercia(impulso);

    }
);


// ==================================================
// CANCELAR
// ==================================================

ruleta.addEventListener(
    "pointercancel",
    function () {

        arrastrando = false;

        ruleta.style.cursor =
            "grab";

    }
);


// ==================================================
// INERCIA
// ==================================================

function iniciarInercia(impulso) {

    const friccion = 0.985;


    function animar() {


        // Reducir velocidad
        impulso *= friccion;


        // Girar
        rotacion += impulso;


        ruleta.style.transform =
            `rotate(${rotacion}deg)`;


        // ==========================================
        // CLAC
        // ==========================================

        comprobarClac();


        // ==========================================
        // DETENER
        // ==========================================

        if (
            Math.abs(impulso) < 0.05
        ) {

            velocidad = 0;


            mostrarResultado();


            return;
        }


        animacion =
            requestAnimationFrame(
                animar
            );
    }


    animacion =
        requestAnimationFrame(
            animar
        );
}


// ==================================================
// MOSTRAR RESULTADO
// ==================================================

function mostrarResultado() {

    let posicion =
        (
            (360 -
                (rotacion % 360)
            ) + 360
        ) % 360;


    const numero =
        Math.floor(
            posicion / 45
        );


    const resultado =
        opciones[numero];


    resultadoTexto.textContent =
        "🎉 ¡Te salió: " +
        resultado +
        "!";


    // ==========================================
    // VENTANA GRANDE
    // ==========================================

    const popup =
        document.getElementById(
            "popup-resultado"
        );


    const resultadoGrande =
        document.getElementById(
            "resultado-grande"
        );


    if (popup && resultadoGrande) {

        resultadoGrande.textContent =
            resultado;


        popup.classList.add(
            "mostrar"
        );
    }

}


// ==================================================
// CERRAR VENTANA
// ==================================================

const popup =
    document.getElementById(
        "popup-resultado"
    );


const botonCerrar =
    document.getElementById(
        "cerrar-resultado"
    );


if (botonCerrar) {

    botonCerrar.addEventListener(
        "click",
        function () {

            popup.classList.remove(
                "mostrar"
            );

        }
    );

}


// ==================================================
// EVITAR ARRASTRAR
// ==================================================

ruleta.addEventListener(
    "dragstart",
    function (e) {

        e.preventDefault();

    }
);