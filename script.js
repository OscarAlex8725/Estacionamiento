let numeroFichaActual = 1; // Contador para el número de ficha
const registroForm = document.getElementById('registroForm');
const vehiculosTable = document.getElementById('vehiculosTable').getElementsByTagName('tbody')[0];
const historialTable = document.getElementById('historialTable').getElementsByTagName('tbody')[0];
const gananciasContainer = document.getElementById('gananciasContainer');

// Cargar datos al iniciar la página
window.onload = function() {
    cargarVehiculos();
    cargarHistorial();
    mostrarGananciasDiarias();
};

registroForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const tipoVehiculo = document.getElementById('tipoVehiculo').value;
    const placas = document.getElementById('placas').value;
    const comentarios = document.getElementById('comentarios').value;
    
    // Verificar si la placa ya está registrada
    if (estaPlacaRegistrada(placas)) {
        alert("La placa ya está registrada. Debe eliminarse antes de agregar nuevamente.");
        return;
    }

    const horaEntrada = new Date();
    const costoPorHora = tipoVehiculo === 'coche' ? 20 : 40;

    // Crear objeto de vehículo
    const vehiculo = {
        numeroFicha: numeroFichaActual,
        tipoVehiculo,
        placas,
        horaEntrada: horaEntrada.toLocaleTimeString(), // Hora local
        costoPorHora,
        comentarios,
        fechaRegistro: horaEntrada.toLocaleDateString() // Fecha local
    };

    // Agregar vehículo a la tabla
    agregarVehiculo(vehiculo);
    
    // Guardar en localStorage
    guardarVehiculo(vehiculo);

    // Incrementar el número de ficha para el próximo vehículo
    numeroFichaActual++;

    registroForm.reset();
});

function estaPlacaRegistrada(placas) {
    let vehiculos = JSON.parse(localStorage.getItem('vehiculos')) || [];
    return vehiculos.some(vehiculo => vehiculo.placas === placas);
}

function agregarVehiculo(vehiculo) {
    const nuevaFila = vehiculosTable.insertRow();
    nuevaFila.innerHTML = `
        <td>${vehiculo.numeroFicha}</td>
        <td>${vehiculo.tipoVehiculo.charAt(0).toUpperCase() + vehiculo.tipoVehiculo.slice(1)}</td>
        <td>${vehiculo.placas}</td>
        <td>${vehiculo.horaEntrada}</td>
        <td>$${vehiculo.costoPorHora}</td>
        <td>
            <button onclick="gestionarSalida(this, '${vehiculo.horaEntrada}', '${vehiculo.fechaRegistro}', ${vehiculo.costoPorHora}, ${vehiculo.numeroFicha}, '${vehiculo.tipoVehiculo}', '${vehiculo.placas}')">Salir</button>
        </td>
    `;
}

function guardarVehiculo(vehiculo) {
    let vehiculos = JSON.parse(localStorage.getItem('vehiculos')) || [];
    vehiculos.push(vehiculo);
    localStorage.setItem('vehiculos', JSON.stringify(vehiculos));
}

function cargarVehiculos() {
    let vehiculos = JSON.parse(localStorage.getItem('vehiculos')) || [];
    vehiculos.forEach(vehiculo => {
        agregarVehiculo(vehiculo);
        numeroFichaActual = Math.max(numeroFichaActual, vehiculo.numeroFicha + 1);
    });
}

function gestionarSalida(boton, horaEntradaISO, fechaRegistroISO, costoPorHora, numeroFicha, tipoVehiculo, placas) {
    const horaSalida = new Date();
    const horaEntrada = new Date();
    const [hours, minutes, seconds] = horaEntradaISO.split(":");
    horaEntrada.setHours(hours, minutes, seconds);

    const tiempoEstacionado = Math.ceil((horaSalida - horaEntrada) / 3600000); // tiempo en horas
    const costoTotal = tiempoEstacionado * costoPorHora;

    // Agregar al historial
    const filaHistorial = historialTable.insertRow();
    filaHistorial.innerHTML = `
        <td>${numeroFicha}</td>
        <td>${tipoVehiculo.charAt(0).toUpperCase() + tipoVehiculo.slice(1)}</td>
        <td>${placas}</td>
        <td>${fechaRegistroISO}</td>
        <td>${horaEntradaISO}</td>
        <td>${horaSalida.toLocaleTimeString()}</td>
        <td>$${costoTotal}</td>
        <td><button onclick="eliminarDelHistorial(this)">Eliminar</button></td>
    `;

    // Eliminar de la tabla de vehículos activos
    boton.parentNode.parentNode.remove();

    // Actualizar localStorage
    eliminarVehiculo(placas);

    // Actualizar ganancias
    actualizarGanancias(costoTotal);
}

function eliminarVehiculo(placas) {
    let vehiculos = JSON.parse(localStorage.getItem('vehiculos')) || [];
    vehiculos = vehiculos.filter(vehiculo => vehiculo.placas !== placas);
    localStorage.setItem('vehiculos', JSON.stringify(vehiculos));
}

function eliminarDelHistorial(boton) {
    boton.parentNode.parentNode.remove();
}

function actualizarGanancias(costo) {
    let ganancias = parseFloat(localStorage.getItem('ganancias')) || 0;
    ganancias += costo;
    localStorage.setItem('ganancias', ganancias);
    mostrarGananciasDiarias();
}

function mostrarGananciasDiarias() {
    const ganancias = parseFloat(localStorage.getItem('ganancias')) || 0;
    gananciasContainer.innerHTML = `<h3>Ganancias del Día: $${ganancias.toFixed(2)}</h3>`;
}

function cargarHistorial() {
    // Aquí podrías cargar un historial si lo tienes almacenado en localStorage
}