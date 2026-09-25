const ruleta =
    document.querySelector(".ruleta");

const resultadoTexto =
    document.getElementById(
        "resultado-texto"
    );

const elementosOpciones =
    Array.from(
        document.querySelectorAll(
            ".ruleta .opcion"
        )
    );


// ==================================================
// DATOS AUTOMÁTICOS
// ==================================================

const opciones =
    elementosOpciones.map(
        opcion =>
            opcion.textContent.trim()
    );


// Funciona con 13, 14, 15...
const cantidadOpciones =
    opciones.length;

const gradosSegmento =
    360 /
    cantidadOpciones;


// ==================================================
// COLORES
// ==================================================

const colores = [
    "#ff595e",
    "#ffca3a",
    "#8ac926",
    "#1982c4",
    "#6a4c93"
];


// ==================================================
// CREAR SEGMENTOS AUTOMÁTICAMENTE
// ==================================================

function crearRuleta() {

    const segmentos = [];

    for (
        let i = 0;
        i < cantidadOpciones;
        i++
    ) {

        const inicio =
            i *
            gradosSegmento;

        const final =
            (i + 1) *
            gradosSegmento;

        const color =
            colores[
                i %
                colores.length
            ];


        segmentos.push(
            `${color} ${inicio}deg ${final}deg`
        );

    }


    ruleta.style.background =
        `conic-gradient(${segmentos.join(",")})`;

}


// ==================================================
// COLOCAR TEXTOS
// ==================================================

function colocarTextos() {

    const tamañoRuleta =
        ruleta.offsetWidth;


    /*
        Distancia del texto desde
        el centro de la ruleta.
    */

    const radio =
        tamañoRuleta *
        0.355;


    elementosOpciones.forEach(
        (opcion, indice) => {

            /*
                Colocar el texto justo
                en el centro del segmento.
            */

            const angulo =
                indice *
                gradosSegmento +
                gradosSegmento /
                2;


            opcion.style.transform =
                `rotate(${angulo}deg)
                 translateY(-${radio}px)`;

        }
    );

}


// ==================================================
// CONSTRUIR RULETA
// ==================================================

crearRuleta();

colocarTextos();


// Volver a colocar textos si cambia
// el tamaño de la pantalla

window.addEventListener(
    "resize",
    colocarTextos
);


// ==================================================
// VARIABLES
// ==================================================

let rotacion =
    0;

let arrastrando =
    false;

let ultimoX =
    0;

let ultimoY =
    0;

let velocidad =
    0;

let animacion =
    null;


// ==================================================
// AUDIO
// ==================================================

let audioContext =
    null;

let ultimoSegmento =
    0;


// ==================================================
// SONIDO CLAC
// ==================================================

function sonidoClac() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }


    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();

    }


    const ahora =
        audioContext.currentTime;


    const oscilador =
        audioContext.createOscillator();


    const ganancia =
        audioContext.createGain();


    oscilador.type =
        "square";


    oscilador.frequency
        .setValueAtTime(
            1200,
            ahora
        );


    oscilador.frequency
        .exponentialRampToValueAtTime(
            500,
            ahora + 0.04
        );


    ganancia.gain
        .setValueAtTime(
            0.18,
            ahora
        );


    ganancia.gain
        .exponentialRampToValueAtTime(
            0.001,
            ahora + 0.05
        );


    oscilador.connect(
        ganancia
    );


    ganancia.connect(
        audioContext.destination
    );


    oscilador.start(
        ahora
    );


    oscilador.stop(
        ahora + 0.05
    );

}


// ==================================================
// COMPROBAR SEGMENTO
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
// INICIAR ARRASTRE
// ==================================================

ruleta.addEventListener(
    "pointerdown",
    function (e) {

        e.preventDefault();


        if (!audioContext) {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

        }


        if (
            audioContext.state ===
            "suspended"
        ) {

            audioContext.resume();

        }


        cancelAnimationFrame(
            animacion
        );


        arrastrando =
            true;

        velocidad =
            0;


        ultimoX =
            e.clientX;

        ultimoY =
            e.clientY;


        ruleta.setPointerCapture(
            e.pointerId
        );


        ruleta.style.cursor =
            "grabbing";

    }
);


// ==================================================
// MOVER RULETA
// ==================================================

ruleta.addEventListener(
    "pointermove",
    function (e) {

        if (!arrastrando) {
            return;
        }


        e.preventDefault();


        const rect =
            ruleta.getBoundingClientRect();


        const centroX =
            rect.left +
            rect.width /
            2;


        const centroY =
            rect.top +
            rect.height /
            2;


        const x1 =
            ultimoX -
            centroX;

        const y1 =
            ultimoY -
            centroY;


        const x2 =
            e.clientX -
            centroX;

        const y2 =
            e.clientY -
            centroY;


        let angulo1 =
            Math.atan2(
                y1,
                x1
            );


        let angulo2 =
            Math.atan2(
                y2,
                x2
            );


        let diferencia =
            angulo2 -
            angulo1;


        if (
            diferencia >
            Math.PI
        ) {

            diferencia -=
                Math.PI *
                2;

        }


        if (
            diferencia <
            -Math.PI
        ) {

            diferencia +=
                Math.PI *
                2;

        }


        const grados =
            diferencia *
            180 /
            Math.PI;


        rotacion +=
            grados;


        ruleta.style.transform =
            `rotate(${rotacion}deg)`;


        comprobarClac();


        velocidad =
            grados;


        ultimoX =
            e.clientX;

        ultimoY =
            e.clientY;

    }
);


// ==================================================
// SOLTAR RULETA
// ==================================================

ruleta.addEventListener(
    "pointerup",
    function (e) {

        if (!arrastrando) {
            return;
        }


        arrastrando =
            false;


        try {

            ruleta.releasePointerCapture(
                e.pointerId
            );

        }
        catch (error) {

        }


        ruleta.style.cursor =
            "grab";


        let impulso =
            velocidad *
            1.8;


        if (
            impulso >
            20
        ) {

            impulso =
                20;

        }


        if (
            impulso <
            -20
        ) {

            impulso =
                -20;

        }


        if (
            Math.abs(impulso) <
            0.2
        ) {

            mostrarResultado();

            return;

        }


        iniciarInercia(
            impulso
        );

    }
);


// ==================================================
// CANCELAR
// ==================================================

ruleta.addEventListener(
    "pointercancel",
    function () {

        arrastrando =
            false;


        ruleta.style.cursor =
            "grab";

    }
);


// ==================================================
// INERCIA
// ==================================================

function iniciarInercia(
    impulso
) {

    const friccion =
        0.985;


    function animar() {

        impulso *=
            friccion;


        rotacion +=
            impulso;


        ruleta.style.transform =
            `rotate(${rotacion}deg)`;


        comprobarClac();


        if (
            Math.abs(impulso) <
            0.05
        ) {

            velocidad =
                0;


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

    /*
        Convertir la rotación
        a un valor entre 0 y 360.
    */

    const rotacionNormalizada =
        (
            (
                rotacion %
                360
            ) +
            360
        ) %
        360;


    /*
        La flecha está arriba.
    */

    const posicion =
        (
            360 -
            rotacionNormalizada
        ) %
        360;


    /*
        Saber qué opción cayó.
    */

    let numero =
        Math.floor(
            posicion /
            gradosSegmento
        );


    /*
        Seguridad.
    */

    numero =
        numero %
        cantidadOpciones;


    const resultado =
        opciones[
            numero
        ];


    // ==================================================
    // RESULTADO DE ABAJO
    // ==================================================

    resultadoTexto.textContent =
        "🎉 ¡Te salió: " +
        resultado;


    // ==================================================
    // POPUP
    // ==================================================

    const popup =
        document.getElementById(
            "popup-resultado"
        );


    const resultadoGrande =
        document.getElementById(
            "resultado-grande"
        );


    if (
        popup &&
        resultadoGrande
    ) {

        resultadoGrande.textContent =
            resultado;


        popup.classList.add(
            "mostrar"
        );

    }

}


// ==================================================
// CERRAR POPUP
// ==================================================

const popup =
    document.getElementById(
        "popup-resultado"
    );


const botonCerrar =
    document.getElementById(
        "cerrar-resultado"
    );


if (
    botonCerrar
) {

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
// EVITAR ARRASTRAR ELEMENTOS
// ==================================================

ruleta.addEventListener(
    "dragstart",
    function (e) {

        e.preventDefault();

    }
);