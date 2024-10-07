let cy;

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
                    'border-width': 2,
                    'border-color': 'black',
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
                    'curve-style': 'bezier'
                }
            },
            {
                selector: '.estado-final',
                style: {
                    'border-color': 'green',
                    'border-width': 4,
                }
            },
            {
                selector: '.estado-actual',
                style: {
                    'background-color': 'orange',
                    'border-color': 'red',
                    'border-width': 4,
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
                    'width': 2
                }
            },
            {
                selector: '#ficticio',  // Añadir estilo específico para el nodo ficticio
                style: {
                    'background-color': 'white', // Color de fondo blanco
                    'border-color': 'white',      // Sin borde visible
                    'border-width': 0             // Sin borde
                }
            }
        ]
    });
}

function dibujarAFD(afdData) {
    // Limpiar la gráfica previa
    cy.elements().remove();

    const estados = afdData.estados;
    const transiciones = afdData.transiciones;
    const estadoInicial = afdData.estado_inicial;

    // Agregar nodos
    estados.forEach(estado => {
        cy.add({
            group: 'nodes',
            data: { id: estado, label: estado },
            classes: afdData.estados_finales.includes(estado) ? 'estado-final' : ''
        });
    });

    // Nodo ficticio para la flecha que apunta al estado inicial
    cy.add({
        group: 'nodes',
        data: { id: 'ficticio', label: '' },  // Nodo invisible
        position: { x: 50, y: 50 }            // Posición arbitraria fuera del grafo principal
    });

    // Flecha que conecta el nodo ficticio con el estado inicial
    cy.add({
        group: 'edges',
        data: {
            source: 'ficticio',
            target: estadoInicial,
            label: '',  // No necesitamos un label para esta flecha
        },
        classes: 'flecha-inicial'  // Clase personalizada para la flecha
    });

    // Agregar transiciones (edges)
    Object.keys(transiciones).forEach(trans => {
        const [origen, simbolo] = trans.split(',');
        const destino = transiciones[trans];
        cy.add({
            group: 'edges',
            data: {
                source: origen.trim(),
                target: destino.trim(),
                label: simbolo.trim(),
            }
        });
    });

    // Aplicar el layout
    cy.layout({ name: 'grid' }).run();
}


async function crearAFD() {
    const estados = document.getElementById('estados').value.split(',');
    const alfabeto = document.getElementById('alfabeto').value.split(',');
    const transicionesText = document.getElementById('transiciones').value.trim().split('\n');
    const transiciones = {};

    transicionesText.forEach(linea => {
        const [origen, simbolo_destino] = linea.split('->');
        const [origenEstado, simbolo] = origen.split(',');
        transiciones[`${origenEstado.trim()},${simbolo.trim()}`] = simbolo_destino.trim();
    });

    const estado_inicial = document.getElementById('estado_inicial').value;
    const estados_finales = document.getElementById('estados_finales').value.split(',');

    const afdData = {
        estados: estados,
        alfabeto: alfabeto,
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

// Inicializar el gráfico al cargar la página
document.addEventListener('DOMContentLoaded', inicializarCytoscape);