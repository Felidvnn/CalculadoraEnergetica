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


// Base de datos de modelos de baterías con capacidad total al 100%
const modelosBaterias = {
    modelo1: { capacidadTotal: 1000 }, // Modelo 1
    modelo2: { capacidadTotal: 800 },  // Modelo 2
    modelo3: { capacidadTotal: 1200 }, // Modelo 3
};

// Función para calcular la capacidad restante de una batería
function calcularCapacidadRestante(opcion, valor, modelo) {
    const capacidadTotal = modelosBaterias[modelo].capacidadTotal;

    if (opcion === 'capacidad_remanente_porcentaje') {
        return (capacidadTotal * valor) / 100;
    } else if (opcion === 'capacidad_remanente_kwh') {
        return valor;
    } else if (opcion === 'anos_uso') {
        const perdida = 0.02 * valor; // 2% de pérdida por año
        return capacidadTotal * (1 - perdida);
    }
    return 0; // Caso inválido
}

// Función para calcular el ROI
function calcularROI(baterias, generacion, consumo, tarifa, horizonte) {
    // 1. Calcular inversión total
    const inversionBaterias = baterias.reduce((total, bateria) => total + bateria.valorCompra, 0);
    const inversionTotal = inversionBaterias * 1.4; // Considera el 40% adicional

    // 2. Calcular almacenamiento real mensual ajustado por capacidad de las baterías
    const almacenamientoMensual = [];
    if (generacion.tipo === 'promedio' && consumo.tipo === 'promedio') {
        const excedente = Math.max(0, generacion.generacionMensual - consumo.consumoMensual);
        const capacidadTotal = baterias.reduce((total, bateria) => total + bateria.capacidadRestante, 0);
        almacenamientoMensual.push(Math.min(excedente, capacidadTotal));
    } else if (generacion.tipo === 'avanzada' && consumo.tipo === 'avanzado') {
        for (const mes in generacion.mensual) {
            const excedente = Math.max(0, generacion.mensual[mes] - (consumo.mensual[mes]?.kWh || 0));
            const capacidadTotal = baterias.reduce((total, bateria) => total + bateria.capacidadRestante, 0);
            almacenamientoMensual.push(Math.min(excedente, capacidadTotal));
        }
    }

    // 3. Calcular ahorro mensual y total
    const ahorroMensual = almacenamientoMensual.map((almacenado) => almacenado * tarifa);
    const ahorroTotal = ahorroMensual.reduce((total, ahorro) => total + ahorro, 0) * horizonte;

    // 4. Calcular ROI
    const gananciasNetas = ahorroTotal;
    const roi = ((gananciasNetas - inversionTotal) / inversionTotal) * 100;

    return {
        inversionTotal,
        gananciasNetas,
        roi,
        almacenamientoMensual,
        ahorroMensual,
        horizonte,
    };
}

// Función para mostrar el ROI
function mostrarROI() {
    const baterias = [];
    document.querySelectorAll('#bateriasContainer .bateria-item').forEach((bateriaElement, index) => {
        const modeloElement = bateriaElement.querySelector('.modeloBateria');
        const opcionBateriaElement = bateriaElement.querySelector('.opcionBateria');
        const valorSeleccionadoElement = bateriaElement.querySelector('.valorSeleccionado');
        const valorCompraElement = bateriaElement.querySelector('.valorCompra');

        if (!modeloElement || !opcionBateriaElement || !valorSeleccionadoElement || !valorCompraElement) {
            console.error(`Datos faltantes en la batería ${index + 1}`);
            return;
        }

        const modelo = modeloElement.value;
        const opcionBateria = opcionBateriaElement.value;
        const valorSeleccionado = parseFloat(valorSeleccionadoElement.value);
        const valorCompra = parseFloat(valorCompraElement.value);

        if (!modelo || isNaN(valorSeleccionado) || isNaN(valorCompra)) {
            console.error(`Datos inválidos en la batería ${index + 1}`);
            return;
        }

        const capacidadRestante = calcularCapacidadRestante(opcionBateria, valorSeleccionado, modelo);

        baterias.push({
            modelo,
            opcionBateria,
            valorSeleccionado,
            valorCompra,
            capacidadRestante,
        });
    });

    // Recopilar datos de generación
    const tipoGeneracion = document.getElementById('tipoGeneracion').value;
    const generacion =
        tipoGeneracion === 'promedio'
            ? { tipo: 'promedio', generacionMensual: parseFloat(document.getElementById('generacionMensual').value) }
            : { tipo: 'avanzada', mensual: obtenerGeneracionMensualAvanzada() };

    // Recopilar datos de consumo
    const tipoConsumo = document.getElementById('tipoConsumo').value;
    const consumo = obtenerConsumoMensual(tipoConsumo);

    // Recopilar tarifa y horizonte
    const tarifa = parseFloat(document.getElementById('tarifaPromedio').value || 0);
    const horizonte = parseInt(document.getElementById('horizonteInversion').value, 10);

    if (!tarifa || !horizonte) {
        console.error("Faltan datos de tarifa o horizonte de inversión");
        return;
    }

    // Calcular ROI
    const resultado = calcularROI(baterias, generacion, consumo, tarifa, horizonte);

    // Mostrar resultados
    document.getElementById('resultado').innerHTML = `
        <h3>Resultados del ROI:</h3>
        <p>Inversión Total: $${resultado.inversionTotal.toFixed(2)}</p>
        <p>Ganancias Netas: $${resultado.gananciasNetas.toFixed(2)}</p>
        <p>ROI: ${resultado.roi.toFixed(2)}%</p>
        <p>Horizonte de Inversión: ${resultado.horizonte} años</p>
    `;
}



// Función para obtener la generación mensual avanzada
function obtenerGeneracionMensualAvanzada() {
    const mensual = {};
    document.querySelectorAll('#generacionAvanzadaTable tbody tr').forEach((fila) => {
        const mes = fila.cells[0].innerText;
        const kWh = parseFloat(fila.querySelector('td input').value);
        mensual[mes] = kWh;
    });
    return mensual;
}

// Función para obtener el consumo mensual
function obtenerConsumoMensual(tipoConsumo) {
    if (tipoConsumo === 'estimado') {
        return {
            tipo: 'estimado',
            comuna: document.getElementById('comuna').value,
            kWhMes: parseFloat(document.getElementById('kWhMes').value),
            tarifa: parseFloat(document.getElementById('tarifa').value),
            cantidadHogares: parseInt(document.getElementById('cantidadHogares').value, 10),
        };
    } else if (tipoConsumo === 'promedio') {
        return {
            tipo: 'promedio',
            consumoMensual: parseFloat(document.getElementById('consumoPromedio').value),
            tarifaPromedio: parseFloat(document.getElementById('tarifaPromedio').value),
        };
    } else if (tipoConsumo === 'avanzado') {
        const mensual = {};
        document.querySelectorAll('.consumo-matriz tbody tr').forEach((fila) => {
            const mes = fila.cells[0].innerText;
            const kWh = parseFloat(fila.cells[1].querySelector('input').value);
            const tarifa = parseFloat(fila.cells[2].querySelector('input').value);
            mensual[mes] = { kWh, tarifa };
        });
        return { tipo: 'avanzado', mensual };
    }
}
