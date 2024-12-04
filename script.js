// Función para mostrar la calculadora correspondiente (ROI o Ahorro)
function mostrarCalculadora(tipo) {
    // Ocultar todas las secciones de calculadoras
    document.getElementById('formROI').style.display = 'none';
    document.getElementById('formRent').style.display = 'none';
    
    // Mostrar la sección correspondiente
    if (tipo === 'roi') {
        document.getElementById('formROI').style.display = 'block';
        document.getElementById('formBateria').style.display = 'block';  // Asegura que la sección de baterías también se vea
    }
    if (tipo === 'rent') {
        document.getElementById('formRent').style.display = 'block';
    }
}

// Función para calcular el ROI
function calcularROI(monto, paneles, baterias, consumo, modeloBateria, valorCompra, opcionBateria, valorSeleccionado) {
    // Aquí puedes realizar los cálculos del ROI según los datos introducidos.
    // Por ahora solo estamos devolviendo los valores de forma estructurada
    return {
        monto: monto,
        paneles: paneles,
        baterias: baterias,
        consumo: consumo,
        modeloBateria: modeloBateria,
        valorCompra: valorCompra,
        opcionBateria: opcionBateria,
        valorSeleccionado: valorSeleccionado
    };
}

// Función para mostrar el resultado del ROI
function mostrarROI() {
    const montoInversion = parseFloat(document.getElementById('monto').value);
    const numPaneles = parseInt(document.getElementById('paneles').value);
    const numBaterias = parseInt(document.getElementById('baterias').value);
    const consumoMensual = parseFloat(document.getElementById('consumo').value);
    const modeloBateria = document.getElementById('modeloBateria').value;
    const valorCompra = parseFloat(document.getElementById('valorCompra').value);
    const opcionBateria = document.getElementById('opcionBateria').value;
    const valorSeleccionado = parseFloat(document.getElementById('valorSeleccionado').value);

    // Aquí se llama a la función para calcular el ROI
    const resultado = calcularROI(montoInversion, numPaneles, numBaterias, consumoMensual, modeloBateria, valorCompra, opcionBateria, valorSeleccionado);

    // Mostrar el resultado
    document.getElementById('resultado').innerHTML = 
        `Datos del ROI:<br>Monto Inversión: $${resultado.monto}<br>Modelo Batería: ${resultado.modeloBateria}<br>Valor Compra: $${resultado.valorCompra}<br>Opción: ${resultado.opcionBateria}<br>Valor Seleccionado: ${resultado.valorSeleccionado}`;
}

// Función para calcular el ahorro
function calcularAhorro(capacidad, consumo, comuna, generacion) {
    // Aquí puedes realizar el cálculo de ahorro según los datos introducidos.
    return {
        capacidad: capacidad,
        consumo: consumo,
        comuna: comuna,
        generacion: generacion
    };
}

// Función para mostrar el resultado del ahorro
function mostrarAhorro() {
    const capacidad = parseFloat(document.getElementById('capacidad').value);
    const consumo = parseInt(document.getElementById('consumo2').value);
    const comuna = parseInt(document.getElementById('comuna').value);
    const generacion = parseFloat(document.getElementById('generacion').value);

    const resultado = calcularAhorro(capacidad, consumo, comuna, generacion);

    document.getElementById('resultado2').innerHTML = 
        `Datos del Ahorro:<br>Capacidad: ${resultado.capacidad} kWh<br>Consumo: ${resultado.consumo} kWh<br>Comuna: ${resultado.comuna}<br>Generación: ${resultado.generacion} kW`;
}


document.addEventListener('DOMContentLoaded', () => {
    const bateriasContainer = document.getElementById('bateriasContainer');
    const addBateriaButton = document.getElementById('addBateriaButton');

    // Agregar nueva batería
    addBateriaButton.addEventListener('click', () => {
        const bateriaItem = document.createElement('div');
        bateriaItem.classList.add('bateria-item');
        bateriaItem.innerHTML = `
            <label for="modeloBateria">Modelo de Batería:</label>
            <select class="modeloBateria" required>
                <option value="">Selecciona un modelo</option>
                <option value="modelo1">Modelo 1</option>
                <option value="modelo2">Modelo 2</option>
                <option value="modelo3">Modelo 3</option>
            </select>

            <div class="bateria-inputs">
                <label for="valorCompra">Valor de compra de la batería($):</label>
                <div class="input-container">
                    <span class="currency">$</span>
                    <input type="number" class="valorCompra" step="1" required>
                </div>
            </div>

            <div class="bateria-select">
                <label for="opcionBateria">Selecciona una opción:</label>
                <select class="opcionBateria" required>
                    <option value="">Elige una opción</option>
                    <option value="capacidad_remanente_porcentaje">Capacidad remanente (%)</option>
                    <option value="capacidad_remanente_kwh">Capacidad remanente (kWh)</option>
                    <option value="anos_uso">Años de uso</option>
                </select>
            </div>

            <div class="bateria-valor">
                <label for="valorSeleccionado">Valor:</label>
                <input type="number" class="valorSeleccionado" step="0.01" required>
            </div>

            <!-- Botón para eliminar batería -->
            <button type="button" class="remove-bateria-btn">X</button>
        `;
        bateriasContainer.appendChild(bateriaItem);

        // Agregar funcionalidad al botón "X"
        const removeButton = bateriaItem.querySelector('.remove-bateria-btn');
        removeButton.addEventListener('click', () => {
            bateriaItem.remove();
        });
    });

    // Funcionalidad para el botón "X" de baterías iniciales
    bateriasContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-bateria-btn')) {
            e.target.closest('.bateria-item').remove();
        }
    });
});

function toggleGeneracion(value) {
    const promedio = document.getElementById('generacionPromedio');
    const avanzada = document.getElementById('generacionAvanzada');

    // Ocultar ambas secciones por defecto
    promedio.style.display = 'none';
    avanzada.style.display = 'none';

    // Mostrar la sección seleccionada
    if (value === 'promedio') {
        promedio.style.display = 'block';
        avanzada.style.display = 'none';
    } else if (value === 'avanzada') {
        avanzada.style.display = 'block';
        promedio.style.display = 'none';
    }
}

// Función para mostrar la opción seleccionada en la sección de Consumo Energético
function mostrarConsumo(valor) {
    // Ocultar todas las opciones
    document.getElementById('estimadoMensual').style.display = 'none';
    document.getElementById('consumoPromedioMensual').style.display = 'none';
    document.getElementById('consumoAvanzado').style.display = 'none';

    // Mostrar la opción seleccionada
    if (valor === 'estimado') {
        document.getElementById('estimadoMensual').style.display = 'block';
    } else if (valor === 'promedio') {
        document.getElementById('consumoPromedioMensual').style.display = 'block';
    } else if (valor === 'avanzado') {
        document.getElementById('consumoAvanzado').style.display = 'block';
    }
}