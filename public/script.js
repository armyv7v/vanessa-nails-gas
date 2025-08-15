// Datos de servicios
const SERVICIOS = {
    1: { nombre: "Retoque (Mantenimiento)", duracion: 120, precio: "$15.000" },
    2: { nombre: "Reconstrucción Uñas Mordidas", duracion: 180, precio: "$25.000" },
    3: { nombre: "Uñas Acrílicas", duracion: 180, precio: "$30.000" },
    4: { nombre: "Uñas Polygel", duracion: 180, precio: "$32.000" },
    5: { nombre: "Uñas Softgel", duracion: 180, precio: "$28.000" },
    6: { nombre: "Kapping Polygel/Acrílico", duracion: 150, precio: "$22.000" },
    7: { nombre: "Reforzamiento Rubber", duracion: 150, precio: "$24.000" },
    8: { nombre: "Esmaltado Permanente", duracion: 90, precio: "$18.000" }
};

// Almacenamiento de la cita
let citaData = {
    servicio: null,
    fecha: null,
    hora: null,
    cliente: null
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Pantalla de servicios
    if (document.querySelector('.service-card')) {
        initServicios();
    }
    
    // Pantalla de fecha/hora
    if (document.getElementById('fecha')) {
        initFechaHora();
    }
    
    // Pantalla de confirmación
    if (document.querySelector('.confirmation-view')) {
        mostrarResumen();
    }
});

function initServicios() {
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', function() {
            const serviceId = this.getAttribute('data-id');
            citaData.servicio = SERVICIOS[serviceId];
            localStorage.setItem('citaData', JSON.stringify(citaData));
            window.location.href = 'seleccion-fecha.html';
        });
    });
}

function initFechaHora() {
    // Cargar servicio seleccionado
    citaData = JSON.parse(localStorage.getItem('citaData'));
    document.getElementById('current-service-name').textContent = citaData.servicio.nombre;
    document.getElementById('current-service-duration').textContent = 
        `${citaData.servicio.duracion} min - ${citaData.servicio.precio}`;

    // Configurar fecha mínima
    const fechaInput = document.getElementById('fecha');
    const hoy = new Date();
    fechaInput.min = new Date(hoy.setDate(hoy.getDate() + 1)).toISOString().split('T')[0];

    fechaInput.addEventListener('change', function() {
        citaData.fecha = this.value;
        generarHorasDisponibles();
    });

    document.getElementById('confirm-btn').addEventListener('click', function() {
        localStorage.setItem('citaData', JSON.stringify(citaData));
        window.location.href = 'confirmacion.html';
    });
}

function generarHorasDisponibles() {
    const contenedor = document.getElementById('time-slots');
    contenedor.innerHTML = '';

    // Generar horas de 9:00 a 19:00 cada 30 min
    for (let hora = 9; hora < 19; hora++) {
        for (let minuto = 0; minuto < 60; minuto += 30) {
            const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = horaStr;
            slot.addEventListener('click', function() {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                this.classList.add('selected');
                citaData.hora = horaStr;
                document.getElementById('confirm-btn').disabled = false;
            });
            contenedor.appendChild(slot);
        }
    }
}

function mostrarResumen() {
    citaData = JSON.parse(localStorage.getItem('citaData'));
    
    // Formatear fecha
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = new Date(citaData.fecha).toLocaleDateString('es-CL', opcionesFecha);
    
    // Mostrar datos
    document.getElementById('resume-service').textContent = citaData.servicio.nombre;
    document.getElementById('resume-date').textContent = fechaFormateada;
    document.getElementById('resume-time').textContent = citaData.hora;
    
    // Enviar datos al backend
    enviarCita();
}

function enviarCita() {
    const formData = {
        nombre: citaData.cliente?.nombre || "No proporcionado",
        email: citaData.cliente?.email || "No proporcionado",
        telefono: citaData.cliente?.telefono || "No proporcionado",
        servicio: citaData.servicio.nombre,
        fecha: citaData.fecha,
        hora: citaData.hora,
        duracion: citaData.servicio.duracion,
        precio: citaData.servicio.precio
    };

    fetch('https://script.google.com/macros/s/TU_SCRIPT_ID/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            console.error("Error al guardar:", data.error);
        }
    })
    .catch(error => console.error("Error:", error));
}