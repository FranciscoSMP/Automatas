let cy;
let estados = [];
let transiciones = {};
let alfabeto = new Set(); 
let estado_inicial = null;
let estados_finales = [];

function inicializarCytoscape() {
    cy = cytoscape({
        container: document.getElementById('cy'),
        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(label)',
                    'background-color': 'lightblue',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'border-width': 1,
                    'border-color': 'black',
                    'width': 45,
                    'height': 45,
                }
            },
            {
                selector: 'edge',
                style: {
                    'label': 'data(label)',
                    'width': 2,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'text-margin-y': -10,
                    'control-point-step-size': 35,
                    'loop-direction': '0deg',
                    'loop-sweep': '40deg'
                }
            },
            {
                selector: '.estado-final',
                style: {
                    'border-color': 'black',
                    'border-width': 1,
                    'width': 35,
                    'height': 35
                }
            },
            {
                selector: '.estado-final-externo',
                style: {
                    'border-color': 'black',
                    'border-width': 1,
                    'width': 44,
                    'height': 44,
                    'background-color': 'lightblue'
                }
            },
            {
                selector: '.estado-actual',
                style: {
                    'background-color': 'orange',
                    'border-color': 'red',
                    'border-width': 1,
                }
            },
            {
                selector: '.flecha-inicial',
                style: {
                    'line-color': 'black',
                    'background-color': 'white',
                    'target-arrow-color': 'black',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'straight',
                    'width': 1
                }
            },
            {
                selector: '#ficticio',
                style: {
                    'background-color': 'white',
                    'border-color': 'white',
                    'border-width': 0,
                    'width': 4,
                    'height': 4
                }
            }
        ],
        zoomingEnabled: true,
        userZoomingEnabled: false
    });
}

document.getElementById('eliminarEstadoBtn').addEventListener('click', function() {
    const estadoAEliminar = document.getElementById('estadoEliminar').value.trim();
    if (estadoAEliminar && estados.includes(estadoAEliminar)) {
        eliminarEstado(estadoAEliminar);
        document.getElementById('estadoEliminar').value = ''; // Limpiar campo de texto
    }
});

document.getElementById('agregarEstadoBtn').addEventListener('click', function() {
    const nuevoEstado = document.getElementById('estado').value.trim();
    if (nuevoEstado && !estados.includes(nuevoEstado)) {
        estados.push(nuevoEstado);
        document.getElementById('estado').value = ''; // Limpiar campo de texto
        cy.add({
            group: 'nodes',
            data: { id: nuevoEstado, label: nuevoEstado },
            position: { x: Math.random() * 130, y: Math.random() * 130}
        });
    }

});

function eliminarEstado(estado) {
    // Eliminar el estado de la lista de estados
    estados = estados.filter(est => est !== estado);

    // Eliminar transiciones asociadas a ese estado
    for (let key in transiciones) {
        const [origen, simbolo] = key.split(',');
        if (origen === estado || transiciones[key] === estado) {
            delete transiciones[key];
        }
    }

    // Eliminar el nodo en Cytoscape
    cy.getElementById(estado).remove();
    if (cy.getElementById(estado + '_externo').length > 0) {
        cy.getElementById(estado + '_externo').remove(); // Remover nodo externo si es estado final
    }

    mostrarEstados();
    mostrarTransiciones();
}

document.getElementById('agregarTransicionBtn').addEventListener('click', function() {
    const estadoOrigen = document.getElementById('transicionOrigen').value.trim();
    const simbolo = document.getElementById('transicionSimbolo').value.trim();
    const estadoDestino = document.getElementById('transicionDestino').value.trim();

    if (estadoOrigen && simbolo && estadoDestino) {
        const transicionKey = `${estadoOrigen},${simbolo}`;
        transiciones[transicionKey] = estadoDestino;

        // Limpiar campos de texto
        document.getElementById('transicionOrigen').value = '';
        document.getElementById('transicionSimbolo').value = '';
        document.getElementById('transicionDestino').value = '';

        // Verificar si ya existe una transición entre los mismos estados
        const existingEdge = cy.edges().filter(edge => {
            return edge.data('source') === estadoOrigen && edge.data('target') === estadoDestino;
        });

        if (existingEdge.length > 0) {
            // Si ya existe, actualizar la etiqueta agregando el nuevo símbolo
            const currentLabel = existingEdge.data('label');
            const newLabel = currentLabel.split(',').includes(simbolo)
                ? currentLabel // Si el símbolo ya está, no lo agregamos
                : currentLabel + ',' + simbolo;

            existingEdge.data('label', newLabel);
        } else {
            // Si no existe, agregar una nueva transición
            cy.add({
                group: 'edges',
                data: {
                    source: estadoOrigen,
                    target: estadoDestino,
                    label: simbolo,
                }
            });
        }
    }
});

document.getElementById('crearAfdBtn').addEventListener('click', function() {
    estado_inicial = document.getElementById('estado_inicial').value.trim();
    estados_finales = document.getElementById('estados_finales').value.trim().split(',');

    const afdData = {
        estados: estados,
        transiciones: transiciones,
        estado_inicial: estado_inicial,
        estados_finales: estados_finales
    };

    crearAFD(afdData); // Llamada a la función para crear el AFD y reflejarlo en el canvas
});

function agregarBotonesZoom() {
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');

    zoomInBtn.addEventListener('click', () => {
        let currentZoom = cy.zoom();
        cy.zoom({
            level: currentZoom + 0.1,  // Ajusta el nivel de zoom
            renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 }  // Centra el zoom
        });
    });

    zoomOutBtn.addEventListener('click', () => {
        let currentZoom = cy.zoom();
        cy.zoom({
            level: currentZoom - 0.1,  // Ajusta el nivel de zoom
            renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 }  // Centra el zoom
        });
    });
}

function dibujarAFD(afdData) {
    const posicionesExistentes = {};
    cy.nodes().forEach(node => {
        posicionesExistentes[node.id()] = node.position();
    });

    cy.elements().remove();

    const estados = afdData.estados;
    const transiciones = afdData.transiciones;
    const estadoInicial = afdData.estado_inicial;

    estados.forEach(estado => {
        let posX, posY;

        if (posicionesExistentes[estado]) {
            posX = posicionesExistentes[estado].x;
            posY = posicionesExistentes[estado].y;
        } else {
            posX = Math.random() * 400;
            posY = Math.random() * 400;
        }

        if (afdData.estados_finales.includes(estado)) {
            cy.add({
                group: 'nodes',
                data: { id: estado + '_externo', label: '' },
                classes: 'estado-final-externo',
                position: { x: posX, y: posY }
            });

            cy.add({
                group: 'nodes',
                data: { id: estado, label: estado },
                classes: 'estado-final',
                position: { x: posX, y: posY }
            });

            const estadoInterno = cy.getElementById(estado);
            const estadoExterno = cy.getElementById(estado + '_externo');
            let isUpdating = false;

            estadoInterno.on('position', function() {
                if (!isUpdating) {
                    isUpdating = true;
                    estadoExterno.position(estadoInterno.position());
                    isUpdating = false;
                }
            });

            estadoExterno.on('position', function() {
                if (!isUpdating) {
                    isUpdating = true;
                    estadoInterno.position(estadoExterno.position());
                    isUpdating = false;
                }
            });
        } else {
            cy.add({
                group: 'nodes',
                data: { id: estado, label: estado },
                position: { x: posX, y: posY }
            });
        }
    });

    cy.add({
        group: 'nodes',
        data: { id: 'ficticio', label: '' },
        position: { x: 50, y: 50 }
    });

    cy.add({
        group: 'edges',
        data: {
            source: 'ficticio',
            target: estadoInicial + (afdData.estados_finales.includes(estadoInicial) ? '_externo' : ''),
            label: '',
        },
        classes: 'flecha-inicial'
    });

    // Agrupar las transiciones por origen y destino
    const transicionesAgrupadas = {};
    Object.keys(transiciones).forEach(trans => {
        const [origen, simbolo] = trans.split(',');
        const destino = transiciones[trans];

        const key = `${origen.trim()}->${destino.trim()}`;

        if (!transicionesAgrupadas[key]) {
            transicionesAgrupadas[key] = [];
        }

        transicionesAgrupadas[key].push(simbolo.trim());
    });

    // Crear las transiciones con los símbolos agrupados
    Object.keys(transicionesAgrupadas).forEach(key => {
        const [origen, destino] = key.split('->');
        const simbolos = transicionesAgrupadas[key].join(',');

        const origenExterno = afdData.estados_finales.includes(origen.trim()) ? origen.trim() + '_externo' : origen.trim();
        const destinoExterno = afdData.estados_finales.includes(destino.trim()) ? destino.trim() + '_externo' : destino.trim();

        cy.add({
            group: 'edges',
            data: {
                source: origenExterno,
                target: destinoExterno,
                label: simbolos,
            }
        });
    });

    cy.layout({ name: 'preset' }).run();
}

async function crearAFD() {
    const estado_inicial = document.getElementById('estado_inicial').value;
    const estados_finales = document.getElementById('estados_finales').value.split(',');

    const afdData = {
        estados: estados,
        alfabeto: [...new Set(Object.keys(transiciones).map(k => k.split(',')[1]))], // Obtener el alfabeto desde las transiciones
        transiciones: transiciones,
        estado_inicial: estado_inicial,
        estados_finales: estados_finales
    };

    const response = await fetch('/create_afd', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(afdData)
    });

    const data = await response.json();
    alert(data.message);
    dibujarAFD(afdData);
    mostrarAFD();
}

async function evaluarCadena() {
    const cadena = document.getElementById('cadena').value;

    const response = await fetch('/evaluate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cadena: cadena })
    });

    const data = await response.json();
    const recorrido = data.recorrido;

    // Resalta el recorrido paso a paso en el gráfico
    resaltarRecorrido(recorrido);

    // Después del recorrido, muestra el resultado
    setTimeout(() => {
        alert(data.resultado ? 'Cadena aceptada' : 'Cadena rechazada');
    }, recorrido.length * 1000 + 500);  // Asegura que el resultado se muestre después del recorrido
}

function resaltarRecorrido(recorrido) {
    // Primero desactiva cualquier resaltado anterior
    cy.elements().removeClass('estado-actual');
    
    recorrido.forEach((estado, index) => {
        setTimeout(() => {
            // Remover el resaltado del estado anterior
            if (index > 0) {
                cy.getElementById(recorrido[index - 1]).removeClass('estado-actual');
            }

            // Resaltar el estado actual
            cy.getElementById(estado).addClass('estado-actual');
        }, index * 1000);  // Esperar un segundo entre cada paso
    });
}

async function mostrarAFD() {
    const response = await fetch('/get_afd');

    if (response.ok) {
        const afdData = await response.json();
        const gramaticaHtml = `
            <h4>Gramática del AFD</h4>
            <p><strong>Conjunto de Estados (Q):</strong> ${afdData.Q.join(', ')}</p>
            <p><strong>Alfabeto (Σ):</strong> ${afdData.Σ.join(', ')}</p>
            <p><strong>Función de Transición (δ):</strong></p>
            <pre>${JSON.stringify(afdData.δ, null, 2)}</pre>
            <p><strong>Estado Inicial (q0):</strong> ${afdData.q0}</p>
            <p><strong>Conjunto de Estados Finales (F):</strong> ${afdData.F.join(', ')}</p>
        `;
        document.getElementById('afd_gramatica').innerHTML = gramaticaHtml;
    } else {
        const errorData = await response.json();
        alert(errorData.message);
    }
}

function agregarEstado() {
    const estado = document.getElementById('estado').value.trim();
    if (estado && !estados.includes(estado)) {
        estados.push(estado);
        mostrarEstados();
    }
    document.getElementById('estado').value = ''; // Limpiar campo
}

function mostrarEstados() {
    const listaEstados = document.getElementById('lista-estados');
    listaEstados.innerHTML = estados.join(', ');
}

function agregarTransicion() {
    const origen = document.getElementById('estado_origen').value.trim();
    const simbolo = document.getElementById('simbolo').value.trim();
    const destino = document.getElementById('estado_destino').value.trim();
    
    if (origen && simbolo && destino) {
        const transicionKey = `${origen},${simbolo}`;
        transiciones[transicionKey] = destino;
        mostrarTransiciones();
    }
    // Limpiar campos
    document.getElementById('estado_origen').value = '';
    document.getElementById('simbolo').value = '';
    document.getElementById('estado_destino').value = '';
}

function mostrarTransiciones() {
    const listaTransiciones = document.getElementById('lista-transiciones');
    listaTransiciones.innerHTML = Object.keys(transiciones)
        .map(key => `${key} -> ${transiciones[key]}`)
        .join('<br>');
}

// Inicializar el gráfico al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    inicializarCytoscape();
    agregarBotonesZoom();
});