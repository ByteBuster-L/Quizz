import { Bot } from './bot/bot.js';
import { GAME_MODE } from './helpers/gamemode.js';

const tablero = document.getElementById('board');
const casillas = [];
let movimientosHumano = [];
let movimientosBot = [];
let bot;
let turno;
const preguntas = [
  {
    pregunta: "¿Cuál es la capital de Francia?",
    opciones: ["Madrid", "París", "Roma"],
    correcta: 1
  },
  {
    pregunta: "¿Cuánto es 2 + 2?",
    opciones: ["3", "4", "5"],
    correcta: 1
  },
  {
    pregunta: "¿Cuál es el color del cielo en un día despejado?",
    opciones: ["Azul", "Verde", "Rojo"],
    correcta: 0
  },
  {
    pregunta: "¿Cuál es el planeta más grande del sistema solar?",
    opciones: ["Marte", "Júpiter", "Saturno"],
    correcta: 1
  },
  {
    pregunta: "¿Quién escribió 'Cien años de soledad'?",
    opciones: ["Gabriel García Márquez", "Pablo Neruda", "Mario Vargas Llosa"],
    correcta: 0
  },
];

function obtenerPreguntaAleatoria() {
  return preguntas[Math.floor(Math.random() * preguntas.length)];
}
let casillaPendiente = null;

function iniciarJuego() {
  tablero.innerHTML = '';
  casillas.length = 0;
  movimientosHumano = [];
  movimientosBot = [];
  bot = new Bot(GAME_MODE.impossible);
  turno = 'humano';

  for (let i = 1; i <= 9; i++) {
    const casilla = document.createElement('div');
    casilla.classList.add('square');
    casilla.setAttribute('id', i);
    casilla.addEventListener('click', () => manejarClick(casilla));
    casillas.push(casilla);
    tablero.appendChild(casilla);
    // Estado inicial para animación (se sobreescribe abajo)
  }

  // Configuración de entradas y colores para cada casilla
  const entradas = [
    { x: -150, y: 0, color: "#2196f3" }, // 1: izquierda, azul
    { x: 0, y: -150, color: "#4caf50" }, // 2: arriba, verde
    { x: 150, y: 0, color: "#ff9800" },  // 3: derecha, naranja
    { x: -150, y: 0, color: "#e91e63" }, // 4: izquierda, rosa
    { x: 0, y: 150, color: "#9c27b0" },  // 5: abajo, morado
    { x: 150, y: 0, color: "#00bcd4" },  // 6: derecha, celeste
    { x: -150, y: 0, color: "#ffc107" }, // 7: izquierda, amarillo
    { x: 0, y: -150, color: "#8bc34a" }, // 8: arriba, verde claro
    { x: 150, y: 0, color: "#f44336" }   // 9: derecha, rojo
  ];

  casillas.forEach((casilla, idx) => {
    const entrada = entradas[idx];
    gsap.fromTo(
      casilla,
      { x: entrada.x, y: entrada.y, scale: 0.7, opacity: 0, backgroundColor: entrada.color },
      {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        backgroundColor: "#f2f2f2",
        duration: 1.5,
        ease: "bounce.out",
        delay: 0.08 * idx
      }
    );
  });
}

function esEmpate() {
  return (movimientosHumano.length + movimientosBot.length === 9) &&
         !verificarGanador(movimientosHumano) &&
         !verificarGanador(movimientosBot);
}

function colorPorIndice(idx) {
  const colores = [
    "#2196f3", // 1: azul
    "#4caf50", // 2: verde
    "#ff9800", // 3: naranja
    "#e91e63", // 4: rosa
    "#9c27b0", // 5: morado
    "#00bcd4", // 6: celeste
    "#ffc107", // 7: amarillo
    "#8bc34a", // 8: verde claro
    "#f44336"  // 9: rojo
  ];
  return colores[idx];
}

function manejarClick(casilla) {
  const id = parseInt(casilla.id);
  if (casilla.textContent || turno !== 'humano') return;

  casillaPendiente = casilla;
  mostrarPreguntaQuiz();
}

function mostrarPreguntaQuiz() {
  const quizDiv = document.getElementById('quiz');
  quizDiv.style.display = 'block';
  const preguntaObj = obtenerPreguntaAleatoria();
  quizDiv.dataset.correcta = preguntaObj.correcta;
  quizDiv.dataset.pregunta = preguntaObj.pregunta;
  document.getElementById('question').textContent = preguntaObj.pregunta;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  preguntaObj.opciones.forEach((op, idx) => {
    const btn = document.createElement('button');
    btn.textContent = op;
    btn.onclick = () => responderQuiz(idx, preguntaObj.correcta, btn, optionsDiv);
    optionsDiv.appendChild(btn);
  });
  document.getElementById('quiz-result').textContent = '';
}

function responderQuiz(idx, correcta, btnClicked, optionsDiv) {
  const quizDiv = document.getElementById('quiz');
  const resultDiv = document.getElementById('quiz-result');
  const buttons = optionsDiv.querySelectorAll('button');
  buttons.forEach((btn, i) => {
    if (i === correcta) {
      btn.classList.add('correct');
    } else {
      btn.classList.add('incorrect');
    }
    btn.disabled = true;
  });

  if (idx === correcta) {
    resultDiv.textContent = "¡Correcto!";
    resultDiv.style.color = "#11ff9e";
    setTimeout(() => {
      quizDiv.style.display = 'none';
      buttons.forEach(btn => btn.classList.remove('correct', 'incorrect'));
      colocarFichaHumano();
    }, 900);
  } else {
    resultDiv.textContent = "Incorrecto. El bot jugará en el opuesto.";
    resultDiv.style.color = "red";
    setTimeout(() => {
      quizDiv.style.display = 'none';
      buttons.forEach(btn => btn.classList.remove('correct', 'incorrect'));
      colocarFichaBotOpuesto();
    }, 1300);
  }
}

function colocarFichaHumano() {
  if (!casillaPendiente) return;
  const id = parseInt(casillaPendiente.id);
  casillaPendiente.textContent = 'X';
  movimientosHumano.push(id);

  casillaPendiente.style.backgroundColor = colorPorIndice(id - 1);

  if (verificarGanador(movimientosHumano)) {
    setTimeout(() => alert("¡Ganaste! 🎉"), 100);
    return reiniciarTablero();
  }
  if (esEmpate()) {
    setTimeout(() => alert("¡Empate! 🤝"), 100);
    return reiniciarTablero();
  }

  turno = 'bot';
  setTimeout(turnoBot, 300);
}

function colocarFichaBotOpuesto() {
  if (!casillaPendiente) return;
  const id = parseInt(casillaPendiente.id);
  const opuestos = {1:9, 2:8, 3:7, 4:6, 5:5, 6:4, 7:3, 8:2, 9:1};
  const opuestoId = opuestos[id];
  const casillaOpuesta = document.getElementById(opuestoId);

  if (casillaOpuesta && !casillaOpuesta.textContent) {
    casillaOpuesta.textContent = 'O';
    movimientosBot.push(opuestoId);
    casillaOpuesta.style.backgroundColor = colorPorIndice(opuestoId - 1);
  } else {
    // Si la opuesta está ocupada, el bot juega normal
    turno = 'bot';
    setTimeout(turnoBot, 300);
    return;
  }

  if (verificarGanador(movimientosBot)) {
    setTimeout(() => alert("Perdiste 😢"), 100);
    return reiniciarTablero();
  }
  if (esEmpate()) {
    setTimeout(() => alert("¡Empate! 🤝"), 100);
    return reiniciarTablero();
  }
  turno = 'humano';
}


function turnoBot() {
  const casillaParaJugar = bot.decidirMovimiento(movimientosHumano, movimientosBot);
  if (!casillaParaJugar) {
    turno = 'humano';
    return;
  }
  const casillaDOM = document.getElementById(casillaParaJugar);
  if (casillaDOM && !casillaDOM.textContent) {
    casillaDOM.textContent = 'O';
    movimientosBot.push(casillaParaJugar);
    casillaDOM.style.backgroundColor = colorPorIndice(casillaParaJugar - 1);
  }
  if (verificarGanador(movimientosBot)) {
    setTimeout(() => alert("Perdiste 😢"), 100);
    return reiniciarTablero();
  }
  if (esEmpate()) {
    setTimeout(() => alert("¡Empate! 🤝"), 100);
    return reiniciarTablero();
  }
  turno = 'humano';
}

function verificarGanador(movimientos) {
  const combinacionesGanadoras = [
    [1, 2, 3], [4, 5, 6], [7, 8, 9],
    [1, 4, 7], [2, 5, 8], [3, 6, 9],
    [1, 5, 9], [3, 5, 7]
  ];
  return combinacionesGanadoras.some(comb => comb.every(pos => movimientos.includes(pos)));
}

function reiniciarTablero() {
  if (casillas.length = 9) {
    setTimeout(() => iniciarJuego(), 500);
  }}

iniciarJuego();
