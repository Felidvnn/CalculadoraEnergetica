// Función para calcular la capacidad restante de una batería
function calcularCapacidadRestante(opcion, valor, modelo) {
    const capacidadTotal = modelosBaterias[modelo]?.capacidadTotal;

    if (!capacidadTotal) {
        console.error(`Modelo de batería no encontrado: ${modelo}`);
        return 0;
    }

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

// Función para agregar una nueva batería dinámicamente
function agregarBateria() {
    const bateriasContainer = document.getElementById('bateriasContainer');
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
            <input type="number" class="valorCompra" step="1" required>
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

    // Agregar funcionalidad al botón "Eliminar"
    bateriaItem.querySelector('.remove-bateria-btn').addEventListener('click', () => {
        bateriaItem.remove();
    });
}

// Event listener para agregar baterías dinámicamente
document.getElementById('addBateriaButton').addEventListener('click', agregarBateria);

// Función para alternar entre generación promedio y avanzada
function toggleGeneracion(value) {
    const promedio = document.getElementById('generacionPromedio');
    const avanzada = document.getElementById('generacionAvanzada');

    promedio.style.display = value === 'promedio' ? 'block' : 'none';
    avanzada.style.display = value === 'avanzada' ? 'block' : 'none';
}

// Función para mostrar la opción seleccionada en la sección de Consumo Energético
function mostrarConsumo(valor) {
    document.getElementById('estimadoMensual').style.display = 'none';
    document.getElementById('consumoPromedioMensual').style.display = 'none';
    document.getElementById('consumoAvanzado').style.display = 'none';

    if (valor === 'estimado') {
        document.getElementById('estimadoMensual').style.display = 'block';
    } else if (valor === 'promedio') {
        document.getElementById('consumoPromedioMensual').style.display = 'block';
    } else if (valor === 'avanzado') {
        document.getElementById('consumoAvanzado').style.display = 'block';
    }
}

// Función para calcular el ROI
function calcularROI(baterias, generacion, consumo, tarifa, horizonte, costosExtra) {
    if (!baterias.length || !generacion || !consumo || !tarifa || !horizonte) {
        console.error("Faltan datos para calcular el ROI");
        return {
            error: true,
            message: "Por favor, asegúrate de ingresar todos los datos requeridos."
        };
    }

    const inversionBaterias = baterias.reduce((total, bateria) => total + bateria.valorCompra, 0);
    const inversionTotal = costosExtra > 0 ? inversionBaterias + costosExtra : inversionBaterias * 1.4;

    const capacidadTotal = baterias.reduce((total, bateria) => total + bateria.capacidadRestante, 0);
    const excedenteMensual = Math.max(0, generacion.generacionMensual - consumo.consumoMensual);

    // Distribuir el excedente entre las baterías según su capacidad restante
    let excedenteRestante = excedenteMensual;
    let almacenamientoReal = 0;

    baterias.forEach((bateria) => {
        if (excedenteRestante <= 0) return;
        const capacidadUsada = Math.min(bateria.capacidadRestante, excedenteRestante);
        almacenamientoReal += capacidadUsada;
        excedenteRestante -= capacidadUsada;
    });

    const ahorroMensual = almacenamientoReal * tarifa;
    const ahorroTotal = ahorroMensual * 12 * horizonte;

    const gananciasNetas = ahorroTotal - inversionTotal;
    const roi = (gananciasNetas / inversionTotal) * 100;

    // Calcular el tiempo necesario para alcanzar el ROI del 100%
    const mesesParaRecuperar = Math.ceil(inversionTotal / ahorroMensual);
    const anos = Math.floor(mesesParaRecuperar / 12);
    const meses = mesesParaRecuperar % 12;

    return {
        inversionTotal: inversionTotal.toFixed(2),
        gananciasNetas: gananciasNetas.toFixed(2),
        roi: roi.toFixed(2),
        almacenamientoReal: almacenamientoReal.toFixed(2),
        ahorroMensual: ahorroMensual.toFixed(2),
        horizonte,
        anosRecuperacion: anos,
        mesesRecuperacion: meses,
    };
}

// Función para mostrar el ROI
function mostrarROI() {
    const baterias = [];
    let camposIncompletos = false;

    // Validar baterías
    document.querySelectorAll('#bateriasContainer .bateria-item').forEach((bateriaElement) => {
        const modeloElement = bateriaElement.querySelector('.modeloBateria');
        const opcionBateriaElement = bateriaElement.querySelector('.opcionBateria');
        const valorSeleccionadoElement = bateriaElement.querySelector('.valorSeleccionado');
        const valorCompraElement = bateriaElement.querySelector('.valorCompra');

        if (!modeloElement.value || !opcionBateriaElement.value || !valorSeleccionadoElement.value || !valorCompraElement.value) {
            camposIncompletos = true;
        }

        const modelo = modeloElement.value;
        const opcionBateria = opcionBateriaElement.value;
        const valorSeleccionado = parseFloat(valorSeleccionadoElement.value);
        const valorCompra = parseFloat(valorCompraElement.value);

        const capacidadRestante = calcularCapacidadRestante(opcionBateria, valorSeleccionado, modelo);

        baterias.push({
            modelo,
            opcionBateria,
            valorSeleccionado,
            valorCompra,
            capacidadRestante,
        });
    });

    // Validar otros campos
    const tipoGeneracion = document.getElementById('tipoGeneracion').value;
    const generacionMensual = parseFloat(document.getElementById('generacionMensual').value || 0);
    const consumoMensual = parseFloat(document.getElementById('consumoPromedio').value || 0);
    const tarifa = parseFloat(document.getElementById('tarifaPromedio').value || 0);
    const horizonte = parseInt(document.getElementById('horizonteInversion').value, 10);
    const costosExtra = parseFloat(document.getElementById('costosExtra').value || 0);

    if (!baterias.length || isNaN(generacionMensual) || isNaN(consumoMensual) || isNaN(tarifa) || isNaN(horizonte) || !tipoGeneracion) {
        camposIncompletos = true;
    }

    if (camposIncompletos) {
        document.getElementById('resultado').innerHTML = `
            <p style="color: red; font-weight: bold;">Error: Por favor completa todos los campos requeridos antes de calcular el ROI.</p>
        `;
        return;
    }

    // Calcular el ROI si todos los campos están completos
    const resultado = calcularROI(baterias, { generacionMensual, tipo: tipoGeneracion }, { consumoMensual }, tarifa, horizonte, costosExtra);

    if (resultado.error) {
        document.getElementById('resultado').innerHTML = `<p style="color: red; font-weight: bold;">Error: ${resultado.message}</p>`;
        return;
    }

    const tablaROI = `
        <h3 style="text-align: center; color: #4CAF50;">Resultados al Momento de Recuperar Inversión</h3>
        <div style="display: flex; justify-content: center;">
            <table style="width: 80%; border-collapse: collapse; border: 1px solid #ddd; font-family: Arial, sans-serif;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Descripción</th>
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">Inversión Total</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">$${resultado.inversionTotal}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">Almacenamiento Real Mensual</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${resultado.almacenamientoReal} kWh</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">Ahorro Mensual</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">$${resultado.ahorroMensual}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">Tiempo para Recuperar Inversión</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${resultado.anosRecuperacion} años y ${resultado.mesesRecuperacion} meses</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    const tablaHorizonte = `
        <h3 style="text-align: center; color: #4CAF50;">Resultados en función del Horizonte de Inversión</h3>
        <div style="display: flex; justify-content: center;">
            <table style="width: 80%; border-collapse: collapse; border: 1px solid #ddd; font-family: Arial, sans-serif;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Descripción</th>
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">Inversión Total</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">$${resultado.inversionTotal}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">Ganancias Netas</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">$${resultado.gananciasNetas}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">% ROI</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${resultado.roi}%</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">Almacenamiento Real Mensual</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${resultado.almacenamientoReal} kWh</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">Ahorro Mensual</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">$${resultado.ahorroMensual}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('resultado').innerHTML = tablaROI + tablaHorizonte;
}

// Base de datos de modelos de baterías con capacidad total al 100%
const modelosBaterias = {
    "Abarth 500e Convertible": { capacidadTotal: 37.8 },
    "Abarth 500e Hatchback": { capacidadTotal: 37.8 },
    "Abarth 600e Scorpionissima": { capacidadTotal: 50.8 },
    "Abarth 600e Turismo": { capacidadTotal: 50.8 },
    "Aiways U5": { capacidadTotal: 60.0 },
    "Aiways U6": { capacidadTotal: 60.0 },
    "Alfa Romeo Junior Elettrica 54 kWh": { capacidadTotal: 50.8 },
    "Alfa Romeo Junior Elettrica 54 kWh Veloce": { capacidadTotal: 50.8 },
    "Alpine A290 Electric 180 hp": { capacidadTotal: 52.0 },
    "Alpine A290 Electric 220 hp": { capacidadTotal: 52.0 },
    "Audi A6 Avant e tron": { capacidadTotal: 75.8 },
    "Audi A6 Avant e tron performance": { capacidadTotal: 94.9 },
    "Audi A6 Avant e tron quattro": { capacidadTotal: 94.9 },
    "Audi A6 Sportback e tron": { capacidadTotal: 75.8 },
    "Audi A6 Sportback e tron performance": { capacidadTotal: 94.9 },
    "Audi A6 Sportback e tron quattro": { capacidadTotal: 94.9 },
    "Audi e tron GT RS": { capacidadTotal: 97.0 },
    "Audi e tron GT RS performance": { capacidadTotal: 97.0 },
    "Audi e tron GT S": { capacidadTotal: 97.0 },
    "Audi Q4 e tron 35": { capacidadTotal: 52.0 },
    "Audi Q4 e tron 45": { capacidadTotal: 77.0 },
    "Audi Q4 e tron 45 quattro": { capacidadTotal: 77.0 },
    "Audi Q4 e tron 55 quattro": { capacidadTotal: 77.0 },
    "Audi Q4 Sportback e tron 35": { capacidadTotal: 52.0 },
    "Audi Q4 Sportback e tron 45": { capacidadTotal: 77.0 },
    "Audi Q4 Sportback e tron 45 quattro": { capacidadTotal: 77.0 },
    "Audi Q4 Sportback e tron 55 quattro": { capacidadTotal: 77.0 },
    "Audi Q6 e tron": { capacidadTotal: 75.8 },
    "Audi Q6 e tron performance": { capacidadTotal: 94.9 },
    "Audi Q6 e tron quattro": { capacidadTotal: 94.9 },
    "Audi Q6 e tron Sportback": { capacidadTotal: 75.8 },
    "Audi Q6 e tron Sportback performance": { capacidadTotal: 94.9 },
    "Audi Q6 e tron Sportback quattro": { capacidadTotal: 94.9 },
    "Audi S6 Avant e tron": { capacidadTotal: 94.9 },
    "Audi S6 Sportback e tron": { capacidadTotal: 94.9 },
    "Audi SQ6 e tron": { capacidadTotal: 94.9 },
    "Audi SQ6 e tron Sportback": { capacidadTotal: 94.9 },
    "BMW i4 eDrive35": { capacidadTotal: 67.1 },
    "BMW i4 eDrive40": { capacidadTotal: 81.3 },
    "BMW i4 M50": { capacidadTotal: 81.3 },
    "BMW i4 xDrive40": { capacidadTotal: 81.3 },
    "BMW i5 eDrive40 Sedan": { capacidadTotal: 81.2 },
    "BMW i5 eDrive40 Touring": { capacidadTotal: 81.2 },
    "BMW i5 M60 xDrive Sedan": { capacidadTotal: 81.2 },
    "BMW i5 M60 xDrive Touring": { capacidadTotal: 81.2 },
    "BMW i5 xDrive40 Sedan": { capacidadTotal: 81.2 },
    "BMW i7 eDrive50": { capacidadTotal: 101.7 },
    "BMW i7 M70 xDrive": { capacidadTotal: 101.7 },
    "BMW i7 xDrive60": { capacidadTotal: 101.7 },
    "BMW iX M60": { capacidadTotal: 105.2 },
    "BMW iX xDrive40": { capacidadTotal: 71.0 },
    "BMW iX xDrive50": { capacidadTotal: 105.2 },
    "BMW iX1 eDrive20": { capacidadTotal: 64.7 },
    "BMW iX1 xDrive30": { capacidadTotal: 64.7 },
    "BMW iX2 eDrive20": { capacidadTotal: 64.7 },
    "BMW iX2 xDrive30": { capacidadTotal: 64.7 },
    "BYD ATTO 3": { capacidadTotal: 60.5 },
    "BYD DOLPHIN 44.9 kWh Active": { capacidadTotal: 44.9 },
    "BYD DOLPHIN 44.9 kWh Boost": { capacidadTotal: 44.9 },
    "BYD DOLPHIN 60.4 kWh": { capacidadTotal: 60.5 },
    "BYD HAN": { capacidadTotal: 85.4 },
    "BYD SEAL 82.5 kWh AWD Excellence": { capacidadTotal: 82.5 },
    "BYD SEAL 82.5 kWh RWD Design": { capacidadTotal: 82.5 },
    "BYD SEAL U 71.8 kWh Comfort": { capacidadTotal: 71.8 },
    "BYD SEAL U 87 kWh Design": { capacidadTotal: 87.0 },
    "BYD SEALION 7 82.5 kWh AWD Design": { capacidadTotal: 82.5 },
    "BYD SEALION 7 82.5 kWh RWD Comfort": { capacidadTotal: 82.5 },
    "BYD SEALION 7 91.3 kWh AWD Excellence": { capacidadTotal: 91.3 },
    "BYD TANG Flagship": { capacidadTotal: 108.8 },
    "Cadillac Lyriq 600 E4": { capacidadTotal: 102.0 },
    "Citroen e Berlingo M 50 kWh": { capacidadTotal: 50.0 },
    "Citroen e Berlingo XL 50 kWh": { capacidadTotal: 50.0 },
    "Citroen e C3": { capacidadTotal: 44.0 },
    "Citroen e C3 Aircross": { capacidadTotal: 44.0 },
    "Citroen e C4": { capacidadTotal: 46.3 },
    "Citroen e C4 54 kWh": { capacidadTotal: 50.8 },
    "Citroen e C4 X": { capacidadTotal: 46.3 },
    "Citroen e SpaceTourer M 50 kWh": { capacidadTotal: 46.3 },
    "Citroen e SpaceTourer M 75 kWh": { capacidadTotal: 68.0 },
    "Citroen e SpaceTourer XL 50 kWh": { capacidadTotal: 46.3 },
    "Citroen e SpaceTourer XL 75 kWh": { capacidadTotal: 68.0 },
    "CUPRA Born 170 kW 59 kWh": { capacidadTotal: 59.0 },
    "CUPRA Born 170 kW 77 kWh": { capacidadTotal: 77.0 },
    "CUPRA Born VZ": { capacidadTotal: 79.0 },
    "CUPRA Tavascan Endurance": { capacidadTotal: 77.0 },
    "CUPRA Tavascan VZ": { capacidadTotal: 77.0 },
    "Dacia Spring Electric 45": { capacidadTotal: 25.0 },
    "Dacia Spring Electric 65": { capacidadTotal: 25.0 },
    "Dongfeng Box 31.4 kWh": { capacidadTotal: 29.0 },
    "Dongfeng Box 42.3 kWh": { capacidadTotal: 40.0 },
    "DS 3 E Tense": { capacidadTotal: 50.8 },
    "Elaris BEO 86 kWh": { capacidadTotal: 81.0 },
    "Fiat 500e 3 1 24 kWh": { capacidadTotal: 21.3 },
    "Fiat 500e 3 1 42 kWh": { capacidadTotal: 37.3 },
    "Fiat 500e Cabrio 24 kWh": { capacidadTotal: 21.3 },
    "Fiat 500e Cabrio 42 kWh": { capacidadTotal: 37.3 },
    "Fiat 500e Hatchback 24 kWh": { capacidadTotal: 21.3 },
    "Fiat 500e Hatchback 42 kWh": { capacidadTotal: 37.3 },
    "Fiat 600e": { capacidadTotal: 50.8 },
    "Fiat Grande Panda": { capacidadTotal: 43.8 },
    "Ford Capri Extended Range AWD": { capacidadTotal: 79.0 },
    "Ford Capri Extended Range RWD": { capacidadTotal: 77.0 },
    "Ford Capri Standard Range RWD": { capacidadTotal: 52.0 },
    "Ford Explorer Extended Range AWD": { capacidadTotal: 79.0 },
    "Ford Explorer Extended Range RWD": { capacidadTotal: 77.0 },
    "Ford Explorer Standard Range RWD": { capacidadTotal: 52.0 },
    "Ford Mustang Mach E ER AWD": { capacidadTotal: 91.0 },
    "Ford Mustang Mach E ER RWD": { capacidadTotal: 91.0 },
    "Ford Mustang Mach E GT": { capacidadTotal: 91.0 },
    "Ford Mustang Mach E Rally": { capacidadTotal: 91.0 },
    "Ford Mustang Mach E SR AWD": { capacidadTotal: 72.6 },
    "Ford Mustang Mach E SR RWD": { capacidadTotal: 72.6 },
    "Ford Puma Gen E": { capacidadTotal: 43.6 },
    "Genesis G80 Electrified Luxury": { capacidadTotal: 82.5 },
    "Genesis GV60 Premium": { capacidadTotal: 74.0 },
    "Genesis GV60 Sport": { capacidadTotal: 74.0 },
    "Genesis GV60 Sport Plus": { capacidadTotal: 74.0 },
    "Genesis GV70 Electrified Sport": { capacidadTotal: 74.0 },
    "GWM ORA 03 48 kWh": { capacidadTotal: 45.4 },
    "GWM ORA 03 63 kWh": { capacidadTotal: 59.3 },
    "GWM ORA 03 GT": { capacidadTotal: 59.3 },
    "GWM ORA 07 GT": { capacidadTotal: 83.5 },
    "GWM ORA 07 Pro": { capacidadTotal: 64.3 },
    "GWM ORA 07 Pure": { capacidadTotal: 64.3 },
    "Honda e Ny1": { capacidadTotal: 61.9 },
    "Hongqi E HS9 120 kWh": { capacidadTotal: 112.0 },
    "Hongqi E HS9 84 kWh": { capacidadTotal: 76.5 },
    "Hongqi E HS9 99 kWh": { capacidadTotal: 90.0 },
    "Hyundai INSTER Long Range": { capacidadTotal: 46.0 },
    "Hyundai INSTER Standard Range": { capacidadTotal: 39.0 },
    "Hyundai IONIQ 5 63 kWh RWD": { capacidadTotal: 60.0 },
    "Hyundai IONIQ 5 84 kWh AWD": { capacidadTotal: 80.0 },
    "Hyundai IONIQ 5 84 kWh RWD": { capacidadTotal: 80.0 },
    "Hyundai IONIQ 5 N": { capacidadTotal: 80.0 },
    "Hyundai IONIQ 6 Long Range 2WD": { capacidadTotal: 74.0 },
    "Hyundai IONIQ 6 Long Range AWD": { capacidadTotal: 74.0 },
    "Hyundai IONIQ 6 Standard Range 2WD": { capacidadTotal: 50.0 },
    "Hyundai IONIQ 9 Long Range AWD": { capacidadTotal: 106.0 },
    "Hyundai IONIQ 9 Long Range RWD": { capacidadTotal: 106.0 },
    "Hyundai IONIQ 9 Performance AWD": { capacidadTotal: 106.0 },
    "Hyundai Kona Electric 48 kWh": { capacidadTotal: 48.4 },
    "Hyundai Kona Electric 65 kWh": { capacidadTotal: 65.4 },
    "Jaguar I Pace EV400": { capacidadTotal: 84.7 },
    "Jeep Avenger Electric": { capacidadTotal: 50.8 },
    "KGM Torres EVX": { capacidadTotal: 72.0 },
    "Kia e Soul 64 kWh": { capacidadTotal: 64.0 },
    "Kia EV3 Long Range": { capacidadTotal: 78.0 },
    "Kia EV3 Standard Range": { capacidadTotal: 55.0 },
    "Kia EV6 GT": { capacidadTotal: 74.0 },
    "Kia EV6 Long Range 2WD": { capacidadTotal: 80.0 },
    "Kia EV6 Long Range AWD": { capacidadTotal: 80.0 },
    "Kia EV6 Standard Range 2WD": { capacidadTotal: 60.0 },
    "Kia EV9 76.1 kWh RWD": { capacidadTotal: 73.0 },
    "Kia EV9 99.8 kWh AWD": { capacidadTotal: 96.0 },
    "Kia EV9 99.8 kWh AWD GT Line": { capacidadTotal: 96.0 },
    "Kia EV9 99.8 kWh RWD": { capacidadTotal: 96.0 },
    "Kia Niro EV": { capacidadTotal: 64.8 },
    "Lancia Ypsilon": { capacidadTotal: 48.1 },
    "Leapmotor C10": { capacidadTotal: 66.0 },
    "Leapmotor T03": { capacidadTotal: 37.3 },
    "Lexus RZ 300e": { capacidadTotal: 64.0 },
    "Lexus RZ 450e": { capacidadTotal: 64.0 },
    "Lexus UX 300e": { capacidadTotal: 64.0 },
    "Lotus Eletre": { capacidadTotal: 109.0 },
    "Lotus Eletre R": { capacidadTotal: 109.0 },
    "Lotus Eletre S": { capacidadTotal: 109.0 },
    "Lotus Emeya": { capacidadTotal: 98.9 },
    "Lotus Emeya R": { capacidadTotal: 98.9 },
    "Lotus Emeya S": { capacidadTotal: 98.9 },
    "Lucid Air Grand Touring": { capacidadTotal: 112.0 },
    "Lucid Air Pure RWD": { capacidadTotal: 92.0 },
    "Lucid Air Touring": { capacidadTotal: 92.0 },
    "Lynk Co 02": { capacidadTotal: 66.0 },
    "Maserati GranCabrio Folgore": { capacidadTotal: 83.0 },
    "Maserati GranTurismo Folgore": { capacidadTotal: 83.0 },
    "Maserati Grecale Folgore": { capacidadTotal: 95.0 },
    "Maxus MIFA 9": { capacidadTotal: 84.0 },
    "Mazda MX 30": { capacidadTotal: 30.0 },
    "Mercedes Benz EQA 250": { capacidadTotal: 66.5 },
    "Mercedes Benz EQA 250 Plus": { capacidadTotal: 70.5 },
    "Mercedes Benz EQA 300 4MATIC": { capacidadTotal: 66.5 },
    "Mercedes Benz EQA 350 4MATIC": { capacidadTotal: 66.5 },
    "Mercedes Benz EQB 250 Plus": { capacidadTotal: 70.5 },
    "Mercedes Benz EQB 300 4MATIC": { capacidadTotal: 66.5 },
    "Mercedes Benz EQB 350 4MATIC": { capacidadTotal: 66.5 },
    "Mercedes Benz EQE 300": { capacidadTotal: 89.0 },
    "Mercedes Benz EQE 350 4MATIC": { capacidadTotal: 90.6 },
    "Mercedes Benz EQE 350 Plus": { capacidadTotal: 96.0 },
    "Mercedes Benz EQE 500 4MATIC": { capacidadTotal: 90.6 },
    "Mercedes Benz EQE AMG 43 4MATIC": { capacidadTotal: 90.6 },
    "Mercedes Benz EQE AMG 53 4MATIC Plus": { capacidadTotal: 90.6 },
    "Mercedes Benz EQE SUV 300": { capacidadTotal: 90.6 },
    "Mercedes Benz EQE SUV 350 4MATIC": { capacidadTotal: 90.6 },
    "Mercedes Benz EQE SUV 350 Plus": { capacidadTotal: 96.0 },
    "Mercedes Benz EQE SUV 500 4MATIC": { capacidadTotal: 96.0 },
    "Mercedes Benz EQE SUV AMG 43 4MATIC": { capacidadTotal: 90.6 },
    "Mercedes Benz EQE SUV AMG 53 4MATIC Plus": { capacidadTotal: 90.6 },
    "Mercedes Benz EQS 450 4MATIC": { capacidadTotal: 118.0 },
    "Mercedes Benz EQS 450 Plus": { capacidadTotal: 118.0 },
    "Mercedes Benz EQS 500 4MATIC": { capacidadTotal: 118.0 },
    "Mercedes Benz EQS 580 4MATIC": { capacidadTotal: 118.0 },
    "Mercedes Benz EQS AMG 53 4MATIC Plus": { capacidadTotal: 118.0 },
    "Mercedes Benz EQS SUV 450 4MATIC": { capacidadTotal: 118.0 },
    "Mercedes Benz EQS SUV 450 Plus": { capacidadTotal: 118.0 },
    "Mercedes Benz EQS SUV 500 4MATIC": { capacidadTotal: 118.0 },
    "Mercedes Benz EQS SUV 580 4MATIC": { capacidadTotal: 118.0 },
    "Mercedes Benz EQS SUV Maybach 680": { capacidadTotal: 118.0 },
    "Mercedes Benz EQT 200 Long": { capacidadTotal: 45.0 },
    "Mercedes Benz EQT 200 Standard": { capacidadTotal: 45.0 },
    "Mercedes Benz EQV 250 Extra Long": { capacidadTotal: 60.0 },
    "Mercedes Benz EQV 250 Long": { capacidadTotal: 60.0 },
    "Mercedes Benz EQV 300 Extra Long": { capacidadTotal: 90.0 },
    "Mercedes Benz EQV 300 Long": { capacidadTotal: 90.0 },
    "Mercedes Benz eVito Tourer Extra Long 60 kWh": { capacidadTotal: 60.0 },
    "Mercedes Benz eVito Tourer Long 60 kWh": { capacidadTotal: 60.0 },
    "Mercedes Benz eVito Tourer Long 90 kWh": { capacidadTotal: 90.0 },
    "Mercedes Benz G 580": { capacidadTotal: 116.0 },
    "MG Cyberster GT": { capacidadTotal: 74.4 },
    "MG Cyberster Trophy": { capacidadTotal: 74.4 },
    "MG Marvel R": { capacidadTotal: 70.0 },
    "MG Marvel R Performance": { capacidadTotal: 70.0 },
    "MG MG4 Electric 51 kWh": { capacidadTotal: 50.8 },
    "MG MG4 Electric 64 kWh": { capacidadTotal: 61.7 },
    "MG MG4 Electric 77 kWh": { capacidadTotal: 74.4 },
    "MG MG4 Electric XPOWER": { capacidadTotal: 61.7 },
    "MG MG5 Electric Long Range": { capacidadTotal: 57.4 },
    "MG MG5 Electric Standard Range": { capacidadTotal: 46.0 },
    "MG ZS EV Long Range": { capacidadTotal: 68.3 },
    "MG ZS EV Standard Range": { capacidadTotal: 49.0 },
    "Mini Aceman E": { capacidadTotal: 38.5 },
    "Mini Aceman JCW": { capacidadTotal: 49.2 },
    "Mini Aceman SE": { capacidadTotal: 49.2 },
    "Mini Cooper E": { capacidadTotal: 36.6 },
    "Mini Cooper JCW": { capacidadTotal: 49.2 },
    "Mini Cooper SE": { capacidadTotal: 49.2 },
    "Mini Countryman E": { capacidadTotal: 64.6 },
    "Mini Countryman SE ALL4": { capacidadTotal: 64.6 },
    "NIO EL6 Long Range": { capacidadTotal: 90.0 },
    "NIO EL6 Standard Range": { capacidadTotal: 73.5 },
    "NIO EL7 Long Range": { capacidadTotal: 90.0 },
    "NIO EL7 Standard Range": { capacidadTotal: 73.5 },
    "NIO EL8 Long Range": { capacidadTotal: 90.0 },
    "NIO EL8 Standard Range": { capacidadTotal: 73.5 },
    "NIO ET5 Long Range": { capacidadTotal: 90.0 },
    "NIO ET5 Standard Range": { capacidadTotal: 73.5 },
    "NIO ET5 Touring Long Range": { capacidadTotal: 90.0 },
    "NIO ET5 Touring Standard Range": { capacidadTotal: 73.5 },
    "NIO ET7 Long Range": { capacidadTotal: 90.0 },
    "NIO ET7 Standard Range": { capacidadTotal: 73.5 },
    "Nissan Ariya 63 kWh": { capacidadTotal: 63.0 },
    "Nissan Ariya 87 kWh": { capacidadTotal: 87.0 },
    "Nissan Ariya e 4ORCE 87 kWh 225 kW": { capacidadTotal: 87.0 },
    "Nissan Ariya e 4ORCE 87 kWh 290 kW": { capacidadTotal: 87.0 },
    "Nissan Leaf": { capacidadTotal: 39.0 },
    "Nissan Leaf ePlus": { capacidadTotal: 59.0 },
    "Nissan Townstar EV Passenger": { capacidadTotal: 45.0 },
    "Omoda E5": { capacidadTotal: 61.0 },
    "Opel Astra Electric": { capacidadTotal: 50.8 },
    "Opel Astra Sports Tourer Electric": { capacidadTotal: 50.8 },
    "Opel Combo e Life 50 kWh": { capacidadTotal: 50.0 },
    "Opel Combo e Life XL 50 kWh": { capacidadTotal: 50.0 },
    "Opel Corsa Electric 50 kWh": { capacidadTotal: 46.3 },
    "Opel Corsa Electric 51 kWh": { capacidadTotal: 48.1 },
    "Opel Frontera 44 kWh": { capacidadTotal: 44.0 },
    "Opel Grandland 73 kWh": { capacidadTotal: 73.0 },
    "Opel Grandland 82 kWh": { capacidadTotal: 82.2 },
    "Opel Mokka Electric": { capacidadTotal: 50.8 },
    "Opel Zafira e Life L2 50 kWh": { capacidadTotal: 46.3 },
    "Opel Zafira e Life L2 75 kWh": { capacidadTotal: 68.0 },
    "Opel Zafira e Life L3 50 kWh": { capacidadTotal: 46.3 },
    "Opel Zafira e Life L3 75 kWh": { capacidadTotal: 68.0 },
    "Peugeot e 2008 50 kWh": { capacidadTotal: 46.3 },
    "Peugeot e 2008 54 kWh": { capacidadTotal: 50.8 },
    "Peugeot e 208 50 kWh": { capacidadTotal: 46.3 },
    "Peugeot e 208 51 kWh": { capacidadTotal: 48.1 },
    "Peugeot e 3008 73 kWh": { capacidadTotal: 73.0 },
    "Peugeot e 3008 73 kWh Dual Motor": { capacidadTotal: 73.0 },
    "Peugeot e 3008 97 kWh Long Range": { capacidadTotal: 96.9 },
    "Peugeot e 308": { capacidadTotal: 50.8 },
    "Peugeot e 308 SW": { capacidadTotal: 50.8 },
    "Peugeot e 408 58 kWh": { capacidadTotal: 58.2 },
    "Peugeot e 5008 73 kWh": { capacidadTotal: 73.0 },
    "Peugeot e 5008 73 kWh Dual Motor": { capacidadTotal: 73.0 },
    "Peugeot e 5008 97 kWh Long Range": { capacidadTotal: 96.9 },
    "Peugeot e Rifter M 50 kWh": { capacidadTotal: 50.0 },
    "Peugeot e Rifter XL 50 kWh": { capacidadTotal: 50.0 },
    "Peugeot e Traveller L2 50 kWh": { capacidadTotal: 46.3 },
    "Peugeot e Traveller L2 75 kWh": { capacidadTotal: 68.0 },
    "Peugeot e Traveller L3 50 kWh": { capacidadTotal: 46.3 },
    "Peugeot e Traveller L3 75 kWh": { capacidadTotal: 68.0 },
    "Polestar 2 Long Range Dual Motor": { capacidadTotal: 79.0 },
    "Polestar 2 Long Range Performance": { capacidadTotal: 79.0 },
    "Polestar 2 Long Range Single Motor": { capacidadTotal: 79.0 },
    "Polestar 2 Standard Range Single Motor": { capacidadTotal: 68.0 },
    "Polestar 3 Long Range Dual motor": { capacidadTotal: 107.0 },
    "Polestar 3 Long Range Performance": { capacidadTotal: 107.0 },
    "Polestar 3 Long Range Single motor": { capacidadTotal: 107.0 },
    "Polestar 4 Long Range Dual Motor": { capacidadTotal: 94.0 },
    "Polestar 4 Long Range Single Motor": { capacidadTotal: 94.0 },
    "Porsche Macan 4 Electric": { capacidadTotal: 95.0 },
    "Porsche Macan 4S Electric": { capacidadTotal: 95.0 },
    "Porsche Macan Electric": { capacidadTotal: 95.0 },
    "Porsche Macan Turbo Electric": { capacidadTotal: 95.0 },
    "Porsche Taycan": { capacidadTotal: 82.3 },
    "Porsche Taycan 4": { capacidadTotal: 82.3 },
    "Porsche Taycan 4 Cross Turismo": { capacidadTotal: 97.0 },
    "Porsche Taycan 4 Plus": { capacidadTotal: 97.0 },
    "Porsche Taycan 4S": { capacidadTotal: 82.3 },
    "Porsche Taycan 4S Cross Turismo": { capacidadTotal: 97.0 },
    "Porsche Taycan 4S Plus": { capacidadTotal: 97.0 },
    "Porsche Taycan 4S Plus Sport Turismo": { capacidadTotal: 97.0 },
    "Porsche Taycan 4S Sport Turismo": { capacidadTotal: 82.3 },
    "Porsche Taycan GTS": { capacidadTotal: 97.0 },
    "Porsche Taycan GTS Sport Turismo": { capacidadTotal: 97.0 },
    "Porsche Taycan Plus": { capacidadTotal: 97.0 },
    "Porsche Taycan Plus Sport Turismo": { capacidadTotal: 97.0 },
    "Porsche Taycan Sport Turismo": { capacidadTotal: 82.3 },
    "Porsche Taycan Turbo": { capacidadTotal: 97.0 },
    "Porsche Taycan Turbo Cross Turismo": { capacidadTotal: 97.0 },
    "Porsche Taycan Turbo GT": { capacidadTotal: 97.0 },
    "Porsche Taycan Turbo GT Weissach": { capacidadTotal: 97.0 },
    "Porsche Taycan Turbo S": { capacidadTotal: 97.0 },
    "Porsche Taycan Turbo S Cross Turismo": { capacidadTotal: 97.0 },
    "Porsche Taycan Turbo S Sport Turismo": { capacidadTotal: 97.0 },
    "Porsche Taycan Turbo Sport Turismo": { capacidadTotal: 97.0 },
    "Renault 5 E Tech 40kWh 120hp": { capacidadTotal: 40.0 },
    "Renault 5 E Tech 40kWh 95hp": { capacidadTotal: 40.0 },
    "Renault 5 E Tech 52kWh 150hp": { capacidadTotal: 52.0 },
    "Renault Kangoo E Tech Electric": { capacidadTotal: 45.0 },
    "Renault Megane E Tech EV40 130hp": { capacidadTotal: 40.0 },
    "Renault Megane E Tech EV60 130hp": { capacidadTotal: 60.0 },
    "Renault Megane E Tech EV60 220hp": { capacidadTotal: 60.0 },
    "Renault Scenic E Tech EV60 170hp": { capacidadTotal: 60.0 },
    "Renault Scenic E Tech EV87 220hp": { capacidadTotal: 87.0 },
    "Rolls Royce Spectre": { capacidadTotal: 102.0 },
    "Skoda Elroq 50": { capacidadTotal: 52.0 },
    "Skoda Elroq 60": { capacidadTotal: 59.0 },
    "Skoda Elroq 85": { capacidadTotal: 77.0 },
    "Skoda Enyaq 50": { capacidadTotal: 52.0 },
    "Skoda Enyaq 85": { capacidadTotal: 77.0 },
    "Skoda Enyaq 85x": { capacidadTotal: 77.0 },
    "Skoda Enyaq Coupe 85": { capacidadTotal: 77.0 },
    "Skoda Enyaq Coupe 85x": { capacidadTotal: 77.0 },
    "Skoda Enyaq Coupe RS": { capacidadTotal: 77.0 },
    "Skoda Enyaq RS": { capacidadTotal: 77.0 },
    "Skywell BE11 Long Range": { capacidadTotal: 81.0 },
    "Skywell BE11 Standard Range": { capacidadTotal: 68.0 },
    "Smart 1 Brabus": { capacidadTotal: 62.0 },
    "Smart 1 Premium": { capacidadTotal: 62.0 },
    "Smart 1 Pro": { capacidadTotal: 47.0 },
    "Smart 1 Pro Plus": { capacidadTotal: 62.0 },
    "Smart 1 Pulse": { capacidadTotal: 62.0 },
    "Smart 1 Pure": { capacidadTotal: 47.0 },
    "Smart 1 Pure Plus": { capacidadTotal: 62.0 },
    "Smart 3 Brabus": { capacidadTotal: 62.0 },
    "Smart 3 Premium": { capacidadTotal: 62.0 },
    "Smart 3 Pro": { capacidadTotal: 47.0 },
    "Smart 3 Pro Plus": { capacidadTotal: 62.0 },
    "SsangYong Korando e Motion": { capacidadTotal: 56.0 },
    "Subaru Solterra AWD": { capacidadTotal: 64.0 },
    "Tesla Model 3": { capacidadTotal: 57.5 },
    "Tesla Model 3 Long Range Dual Motor": { capacidadTotal: 75.0 },
    "Tesla Model 3 Long Range RWD": { capacidadTotal: 75.0 },
    "Tesla Model 3 Performance": { capacidadTotal: 75.0 },
    "Tesla Model S Dual Motor": { capacidadTotal: 95.0 },
    "Tesla Model S Plaid": { capacidadTotal: 95.0 },
    "Tesla Model X Dual Motor": { capacidadTotal: 95.0 },
    "Tesla Model X Plaid": { capacidadTotal: 95.0 },
    "Tesla Model Y": { capacidadTotal: 57.5 },
    "Tesla Model Y Long Range Dual Motor": { capacidadTotal: 75.0 },
    "Tesla Model Y Long Range RWD": { capacidadTotal: 75.0 },
    "Tesla Model Y Performance": { capacidadTotal: 75.0 },
    "Toyota bZ4X AWD": { capacidadTotal: 64.0 },
    "Toyota bZ4X FWD": { capacidadTotal: 64.0 },
    "Toyota Proace City Verso Electric L1 50 kWh": { capacidadTotal: 50.0 },
    "Toyota Proace City Verso Electric L2 50 kWh": { capacidadTotal: 50.0 },
    "Toyota PROACE Verso L 75 kWh": { capacidadTotal: 68.0 },
    "Toyota PROACE Verso M 50 kWh": { capacidadTotal: 46.3 },
    "Toyota PROACE Verso M 75 kWh": { capacidadTotal: 68.0 },
    "VinFast VF 8 Eco Extended Range": { capacidadTotal: 87.7 },
    "VinFast VF 8 Plus Extended Range": { capacidadTotal: 87.7 },
    "VinFast VF 9 Extended Range": { capacidadTotal: 123.0 },
    "Volkswagen ID Buzz LWB GTX": { capacidadTotal: 86.0 },
    "Volkswagen ID Buzz LWB Pro": { capacidadTotal: 86.0 },
    "Volkswagen ID Buzz NWB GTX": { capacidadTotal: 79.0 },
    "Volkswagen ID Buzz NWB Pro": { capacidadTotal: 79.0 },
    "Volkswagen ID 3 GTX": { capacidadTotal: 79.0 },
    "Volkswagen ID 3 GTX Performance": { capacidadTotal: 79.0 },
    "Volkswagen ID 3 Pro": { capacidadTotal: 59.0 },
    "Volkswagen ID 3 Pro S": { capacidadTotal: 77.0 },
    "Volkswagen ID 3 Pure": { capacidadTotal: 52.0 },
    "Volkswagen ID 4 GTX": { capacidadTotal: 77.0 },
    "Volkswagen ID 4 Pro": { capacidadTotal: 77.0 },
    "Volkswagen ID 4 Pro 4MOTION": { capacidadTotal: 77.0 },
    "Volkswagen ID 4 Pure": { capacidadTotal: 52.0 },
    "Volkswagen ID 5 GTX": { capacidadTotal: 77.0 },
    "Volkswagen ID 5 Pro": { capacidadTotal: 77.0 },
    "Volkswagen ID 7 GTX": { capacidadTotal: 86.0 },
    "Volkswagen ID 7 Pro": { capacidadTotal: 77.0 },
    "Volkswagen ID 7 Pro S": { capacidadTotal: 86.0 },
    "Volkswagen ID 7 Tourer GTX": { capacidadTotal: 86.0 },
    "Volkswagen ID 7 Tourer Pro": { capacidadTotal: 77.0 },
    "Volkswagen ID 7 Tourer Pro S": { capacidadTotal: 86.0 },
    "Volvo EC40 Single Motor": { capacidadTotal: 67.0 },
    "Volvo EC40 Single Motor ER": { capacidadTotal: 79.0 },
    "Volvo EC40 Twin Motor": { capacidadTotal: 79.0 },
    "Volvo EC40 Twin Motor Performance": { capacidadTotal: 79.0 },
    "Volvo EX30 Single Motor": { capacidadTotal: 49.0 },
    "Volvo EX30 Single Motor ER": { capacidadTotal: 64.0 },
    "Volvo EX30 Twin Motor Performance": { capacidadTotal: 64.0 },
    "Volvo EX40 Single Motor": { capacidadTotal: 67.0 },
    "Volvo EX40 Single Motor ER": { capacidadTotal: 79.0 },
    "Volvo EX40 Twin Motor": { capacidadTotal: 79.0 },
    "Volvo EX40 Twin Motor Performance": { capacidadTotal: 79.0 },
    "Volvo EX90 Single Motor": { capacidadTotal: 101.0 },
    "Volvo EX90 Twin Motor": { capacidadTotal: 107.0 },
    "Volvo EX90 Twin Motor Performance": { capacidadTotal: 107.0 },
    "Voyah Free 106 kWh": { capacidadTotal: 100.0 },
    "XPENG G6 AWD Performance": { capacidadTotal: 87.5 },
    "XPENG G6 RWD Long Range": { capacidadTotal: 87.5 },
    "XPENG G6 RWD Standard Range": { capacidadTotal: 66.0 },
    "XPENG G9 AWD Performance": { capacidadTotal: 93.1 },
    "XPENG G9 RWD Long Range": { capacidadTotal: 93.1 },
    "XPENG G9 RWD Standard Range": { capacidadTotal: 75.8 },
    "XPENG P7 AWD Performance": { capacidadTotal: 82.7 },
    "XPENG P7 RWD Long Range": { capacidadTotal: 82.7 },
    "XPENG P7 Wing Edition": { capacidadTotal: 82.7 },
    "Zeekr 001 Long Range RWD": { capacidadTotal: 94.0 },
    "Zeekr 001 Performance AWD": { capacidadTotal: 94.0 },
    "Zeekr 001 Privilege AWD": { capacidadTotal: 94.0 },
    "Zeekr X Long Range RWD": { capacidadTotal: 64.0 },
    "Zeekr X Privilege AWD": { capacidadTotal: 64.0 }
};


// Función para cargar los modelos en todos los selectores de baterías
function actualizarSelectoresDeModelo() {
    const selectores = document.querySelectorAll('.modeloBateria');
    selectores.forEach((selector) => {
        selector.innerHTML = '<option value=\"\">Selecciona un modelo</option>';
        for (const modelo in modelosBaterias) {
            const option = document.createElement('option');
            option.value = modelo;
            option.textContent = modelo;
            selector.appendChild(option);
        }
    });
}

// Llama a esta función al cargar la página
window.addEventListener('load', actualizarSelectoresDeModelo);

// Asegúrate de llamar a esta función también cada vez que se agregue una nueva batería
document.getElementById('addBateriaButton').addEventListener('click', () => {
    actualizarSelectoresDeModelo(); // Actualiza los selectores
});
