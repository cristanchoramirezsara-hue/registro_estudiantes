const CANTIDAD_NOTAS = 5;
const NOTA_MINIMA = 0;
const NOTA_MAXIMA = 5;
const NOTA_APROBACION = 3;

const formulario = document.getElementById("formulario");
const botonLimpiar = document.getElementById("btn-limpiar");
const panelResultado = document.getElementById("resultado");
const bloqueVacio = document.getElementById("vacio");
const bloqueDatos = document.getElementById("datos");

const campos = ["nombre", "edad", "curso", "cc"];
const camposNotas = Array.from({ length: CANTIDAD_NOTAS }, (_, i) => "nota" + (i + 1));

/* ---------- Utilidades ---------- */

// Acepta coma o punto como separador decimal (3,5 o 3.5)
function leerNumero(texto) {
  const limpio = texto.trim().replace(",", ".");
  if (limpio === "" || isNaN(Number(limpio))) return NaN;
  return Number(limpio);
}

function mostrarError(id, mensaje) {
  const input = document.getElementById(id);
  const aviso = document.getElementById("err-" + id);
  aviso.textContent = mensaje;
  if (mensaje) {
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", "err-" + id);
  } else {
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
  }
}

function limpiarErrores() {
  [...campos, ...camposNotas].forEach((id) => mostrarError(id, ""));
}

/* ---------- Validación ---------- */

function validar() {
  const errores = {};
  const valores = {};

  valores.nombre = document.getElementById("nombre").value.trim();
  if (valores.nombre.length < 3) {
    errores.nombre = "Escribe el nombre completo del estudiante.";
  }

  const textoEdad = document.getElementById("edad").value.trim();
  valores.edad = Number(textoEdad);
  if (!/^\d+$/.test(textoEdad) || valores.edad < 3 || valores.edad > 100) {
    errores.edad = "Escribe una edad entera entre 3 y 100.";
  }

  valores.curso = document.getElementById("curso").value.trim();
  if (valores.curso === "") {
    errores.curso = "Escribe el curso.";
  }

  valores.cc = document.getElementById("cc").value.trim();
  if (!/^\d{5,12}$/.test(valores.cc)) {
    errores.cc = "Usa solo números, entre 5 y 12 dígitos.";
  }

  valores.notas = camposNotas.map((id) => {
    const nota = leerNumero(document.getElementById(id).value);
    if (isNaN(nota)) {
      errores[id] = "Escribe una nota.";
    } else if (nota < NOTA_MINIMA || nota > NOTA_MAXIMA) {
      errores[id] = "Debe estar entre 0 y 5.";
    }
    return nota;
  });

  return { errores, valores };
}

/* ---------- Resultado ---------- */

function mostrarResultado(valores) {
  const suma = valores.notas.reduce((total, nota) => total + nota, 0);
  const definitiva = suma / CANTIDAD_NOTAS;
  const aprobado = definitiva >= NOTA_APROBACION;
  const primerNombre = valores.nombre.split(" ")[0];

  document.getElementById("r-nombre").textContent = valores.nombre;
  document.getElementById("r-detalle").textContent =
    "CC " + valores.cc + " · Curso " + valores.curso + " · " + valores.edad + " años";
  document.getElementById("r-definitiva").textContent = definitiva.toFixed(2);

  document.getElementById("r-veredicto").textContent = aprobado
    ? primerNombre + ", aprobaste"
    : primerNombre + ", reprobaste";

  const lista = document.getElementById("r-notas");
  lista.innerHTML = "";
  valores.notas.forEach((nota, i) => {
    const item = document.createElement("li");
    item.textContent = nota.toFixed(1);
    if (nota < NOTA_APROBACION) item.classList.add("baja");
    const etiqueta = document.createElement("small");
    etiqueta.textContent = "Nota " + (i + 1);
    item.appendChild(etiqueta);
    lista.appendChild(item);
  });

  panelResultado.classList.remove("es-aprobado", "es-reprobado");
  panelResultado.classList.add(aprobado ? "es-aprobado" : "es-reprobado");

  bloqueVacio.hidden = true;
  bloqueDatos.hidden = false;

  // Anima el medidor desde cero hasta la nota
  const medidor = document.getElementById("medidor-valor");
  medidor.style.strokeDasharray = "0 100";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      medidor.style.strokeDasharray = (definitiva / NOTA_MAXIMA) * 100 + " 100";
    });
  });

  if (window.matchMedia("(max-width: 860px)").matches) {
    panelResultado.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function reiniciarResultado() {
  bloqueDatos.hidden = true;
  bloqueVacio.hidden = false;
  panelResultado.classList.remove("es-aprobado", "es-reprobado");
}

/* ---------- Eventos ---------- */

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  limpiarErrores();

  const { errores, valores } = validar();
  const ids = Object.keys(errores);

  if (ids.length > 0) {
    ids.forEach((id) => mostrarError(id, errores[id]));
    reiniciarResultado();
    document.getElementById(ids[0]).focus();
    return;
  }

  mostrarResultado(valores);
});

botonLimpiar.addEventListener("click", () => {
  formulario.reset();
  limpiarErrores();
  reiniciarResultado();
  document.getElementById("nombre").focus();
});

// Quita el error de un campo apenas la persona vuelve a escribir en él
[...campos, ...camposNotas].forEach((id) => {
  document.getElementById(id).addEventListener("input", () => mostrarError(id, ""));
});
