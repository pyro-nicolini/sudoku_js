const game = document.getElementById("game");

// Crear tablero visual
const tablero = document.createElement("div");
tablero.id = "tablero";
game.appendChild(tablero);
game.insertBefore(tablero, game.firstChild);

for (let fila = 0; fila < 9; fila++) {
  for (let col = 0; col < 9; col++) {
    const celda = document.createElement("input");
    celda.type = "text";
    celda.maxLength = 1;
    celda.classList.add("celda");
    celda.dataset.fila = fila;
    celda.dataset.col = col;
    tablero.appendChild(celda);
  }
}

// Función para mostrar mensajes en la lista
function logEnLista(mensaje, color = "white") {
  const ul = document.querySelector("#lista ul");
  const li = document.createElement("li");
  li.textContent = mensaje;
  li.style.color = color;
  ul.appendChild(li);
}

function limpiarLista() {
  const ul = document.querySelector("#lista ul");
  ul.innerHTML = "";
}

let solucion = [];

// === CARGAR DESDE API ===
async function cargarSudokuDesdeAPI() {
  try {
    const res = await fetch("https://sudoku-api.vercel.app/api/dosuku");
    const data = await res.json();
    const sudoku = data.newboard.grids[0].value;
    const dificult = data.newboard.grids[0].difficulty;
    solucion = data.newboard.grids[0].solution;
    poblarTablero(sudoku);
    logEnLista(`✅ Sudoku cargado desde la API dificultad: ${dificult}`, "wheat");
  } catch (err) {
    logEnLista("❌ Error al obtener el Sudoku", "red");
  }
}



function poblarTablero(matriz) {
  document.querySelectorAll(".celda").forEach((input) => {
    const fila = input.dataset.fila;
    const col = input.dataset.col;
    const valor = matriz[fila][col];
    input.value = valor !== 0 ? valor : "";
    if (input.value !== "") {
      input.disabled = true;
    }
  });
}

function leerTableroDesdeInputs() {
  const tablero = Array.from({ length: 9 }, () => []);
  document.querySelectorAll(".celda").forEach((input) => {
    const fila = parseInt(input.dataset.fila);
    const col = parseInt(input.dataset.col);
    const valor = parseInt(input.value) || 0;
    tablero[fila][col] = valor;
  });
  return tablero;
}

function verificarDesdeInputs() {
  const tablero = leerTableroDesdeInputs();
  verificarSudoku(tablero);
}

// === VERIFICACIONES ===
function noHayRepetidos(arr) {
  const sinCeros = arr.filter((n) => n !== 0);
  return new Set(sinCeros).size === sinCeros.length;
}

function sumaEs45(arr) {
  return arr.reduce((acc, val) => acc + val, 0) === 45;
}

function verificarFilas(tablero) {
  let filasValidas = 0;
  tablero.forEach((fila, i) => {
    if (noHayRepetidos(fila) && sumaEs45(fila)) {
      logEnLista(`Fila ${i + 1} ✅ sin repetidas`, "green");
      filasValidas++;
    } else {
      logEnLista(`Fila ${i + 1} ❌`, "orange");
    }
  });
  return filasValidas === 9;
}

function getColumna(tablero, i) {
  return tablero.map((fila) => fila[i]);
}

function verificarColumnas(tablero) {
  let columnasValidas = 0;
  for (let i = 0; i < 9; i++) {
    const col = getColumna(tablero, i);
    if (noHayRepetidos(col) && sumaEs45(col)) {
      logEnLista(`Columna ${i + 1} ✅ sin repetidas`, "green");
      columnasValidas++;
    } else {
      logEnLista(`Columna ${i + 1} ❌`, "orange");
    }
  }
  return columnasValidas === 9;
}

function getBloque(tablero, filaBase, colBase) {
  const bloque = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      bloque.push(tablero[filaBase + i][colBase + j]);
    }
  }
  return bloque;
}

function verificarBloques(tablero) {
  let bloquesValidos = 0;
  let numero = 1;
  for (let fila = 0; fila < 9; fila += 3) {
    for (let col = 0; col < 9; col += 3) {
      const bloque = getBloque(tablero, fila, col);
      if (noHayRepetidos(bloque) && sumaEs45(bloque)) {
        logEnLista(`Bloque ${numero} ✅ sin repetidos`, "green");
        bloquesValidos++;
      } else {
        logEnLista(`Bloque ${numero} ❌`, "red");
      }
      numero++;
    }
  }
  return bloquesValidos === 9;
}

function verificarSudoku(tablero) {
  limpiarLista();
  logEnLista("--- VERIFICANDO SUDOKU ---", "blue");

  const filas = verificarFilas(tablero);
  const columnas = verificarColumnas(tablero);
  const bloques = verificarBloques(tablero);

  if (filas && columnas && bloques) {
    logEnLista("✅ ¡Ganaste! Sudoku válido.", "white");
    logEnLista("🎉 Felicidades!", "lightgreen");
  } else {
    logEnLista("❌ Sudoku inválido. Corrige los errores.", "red");
  }
}

// Iniciar
cargarSudokuDesdeAPI();
