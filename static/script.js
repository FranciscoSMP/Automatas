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
                    'curve-style': 'bezier'
                }
            },
            {
                selector: '.estado-final',
                style: {
                    'border-color': 'black',
                    'border-width': 1,
                    'width': 35,  // Tamaño del nodo interno (más pequeño)
                    'height': 35
                }
            },
            {
                selector: '.estado-final-externo',
                style: {
                    'border-color': 'black',
                    'border-width': 1,
                    'width': 45,  // Tamaño del nodo externo (más grande)
                    'height': 45,
                    'background-color': 'white'  // Nodo externo debe ser transparente
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
        if (afdData.estados_finales.includes(estado)) {
            // Posición inicial aleatoria
            const posX = Math.random() * 400;
            const posY = Math.random() * 400;

            // Añadir nodo más grande (estado-final-externo), que recibirá las transiciones
            cy.add({
                group: 'nodes',
                data: { id: estado + '_externo', label: '' },  // Nodo externo sin etiqueta
                classes: 'estado-final-externo',
                position: { x: posX, y: posY }  // Posición inicial
            });

            // Añadir nodo más pequeño con la etiqueta
            cy.add({
                group: 'nodes',
                data: { id: estado, label: estado },  // Nodo interno con la etiqueta
                classes: 'estado-final',
                position: { x: posX, y: posY }  // Posición inicial
            });

            // Vincular movimientos entre el nodo pequeño y el grande
            const estadoInterno = cy.getElementById(estado);
            const estadoExterno = cy.getElementById(estado + '_externo');

            // Evitar la actualización circular
            let isUpdating = false;

            // Sincronizar movimiento del nodo pequeño con el grande
            estadoInterno.on('position', function(evt) {
                if (!isUpdating) {
                    isUpdating = true;
                    const pos = estadoInterno.position();
                    estadoExterno.position(pos);
                    isUpdating = false;
                }
            });

            // Sincronizar movimiento del nodo grande con el pequeño
            estadoExterno.on('position', function(evt) {
                if (!isUpdating) {
                    isUpdating = true;
                    const pos = estadoExterno.position();
                    estadoInterno.position(pos);
                    isUpdating = false;
                }
            });

        } else {
            // Nodo normal
            cy.add({
                group: 'nodes',
                data: { id: estado, label: estado }
            });
        }
    });

    // Nodo ficticio para la flecha que apunta al estado inicial
    cy.add({
        group: 'nodes',
        data: { id: 'ficticio', label: '' },
        position: { x: 50, y: 50 }  // Posición fija para el nodo ficticio
    });

    // Flecha que conecta el nodo ficticio con el estado inicial
    cy.add({
        group: 'edges',
        data: {
            source: 'ficticio',
            target: estadoInicial + (afdData.estados_finales.includes(estadoInicial) ? '_externo' : ''),  // Apunta al nodo externo si es estado final
            label: '',
        },
        classes: 'flecha-inicial'
    });

    // Agregar transiciones (edges)
    Object.keys(transiciones).forEach(trans => {
        const [origen, simbolo] = trans.split(',');
        const destino = transiciones[trans];

        // Comprobamos si el origen y el destino son estados finales
        const origenExterno = afdData.estados_finales.includes(origen.trim()) ? origen.trim() + '_externo' : origen.trim();
        const destinoExterno = afdData.estados_finales.includes(destino.trim()) ? destino.trim() + '_externo' : destino.trim();

        // Crear la transición
        cy.add({
            group: 'edges',
            data: {
                source: origenExterno,  // Transición desde el nodo externo (si es final) o el nodo normal
                target: destinoExterno,  // Transición hacia el nodo externo (si es final) o el nodo normal
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
    
    // Mostrar la gramática después de crear el AFD
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


// Inicializar el gráfico al cargar la página
document.addEventListener('DOMContentLoaded', inicializarCytoscape);