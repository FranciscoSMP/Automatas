let cy; // Variable para almacenar la instancia de Cytoscape.
let estados = []; // Lista de estados del autómata.
let transiciones = {}; // Objeto que almacena las transiciones del autómata.
let alfabeto = new Set(); // Conjunto que almacena los símbolos del alfabeto.
let estado_inicial = null; // Variable para almacenar el estado inicial del autómata.
let estados_finales = []; // Lista de estados finales del autómata.

// Función para inicializar Cytoscape, el gráfico que representará el autómata.
function inicializarCytoscape() {
    cy = cytoscape({
        container: document.getElementById('cy'), // Elemento HTML donde se mostrará el gráfico.
        style: [ // Estilos para los nodos y las aristas del gráfico.
            {
                selector: 'node',
                style: {
                    'label': 'data(label)', // Etiqueta del nodo.
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
                    'label': 'data(label)', // Etiqueta de la arista.
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
            // Estilo especial para los estados finales del autómata.
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
            // Estilo para el estado actual (resaltado).
            {
                selector: '.estado-actual',
                style: {
                    'background-color': 'orange',
                    'border-color': 'red',
                    'border-width': 1,
                }
            },
            // Estilo para la flecha que representa la transición inicial.
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
            // Nodo ficticio para dibujar la flecha inicial desde fuera del estado inicial.
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
        zoomingEnabled: true, // Habilitar el zoom en el gráfico.
        userZoomingEnabled: false // Deshabilitar el zoom por parte del usuario.
    });
}

// Función para eliminar un estado cuando se hace clic en el botón de eliminar.
document.getElementById('eliminarEstadoBtn').addEventListener('click', function() {
    const estadoAEliminar = document.getElementById('estadoEliminar').value.trim();
    if (estadoAEliminar && estados.includes(estadoAEliminar)) {
        eliminarEstado(estadoAEliminar); // Llamada a la función que elimina el estado.
        document.getElementById('estadoEliminar').value = ''; // Limpia el campo de entrada.
    }
});

// Función para agregar un nuevo estado cuando se hace clic en el botón de agregar.
document.getElementById('agregarEstadoBtn').addEventListener('click', function() {
    const nuevoEstado = document.getElementById('estado').value.trim();
    if (nuevoEstado && !estados.includes(nuevoEstado)) {
        estados.push(nuevoEstado); // Agrega el nuevo estado a la lista de estados.
        document.getElementById('estado').value = ''; // Limpia el campo de entrada.
        cy.add({
            group: 'nodes', // Añadir un nuevo nodo en Cytoscape.
            data: { id: nuevoEstado, label: nuevoEstado },
            position: { x: Math.random() * 130, y: Math.random() * 130} // Posición aleatoria para el nodo.
        });
    }
});

// Función para eliminar un estado del autómata.
function eliminarEstado(estado) {
    estados = estados.filter(est => est !== estado); // Elimina el estado de la lista.

    // Elimina las transiciones asociadas con el estado eliminado.
    for (let key in transiciones) {
        const [origen, simbolo] = key.split(',');
        if (origen === estado || transiciones[key] === estado) {
            delete transiciones[key]; // Elimina la transición.
        }
    }

    cy.getElementById(estado).remove(); // Elimina el nodo del gráfico.
    if (cy.getElementById(estado + '_externo').length > 0) {
        cy.getElementById(estado + '_externo').remove(); // Elimina la representación externa del estado.
    }

    mostrarEstados(); // Actualiza la visualización de los estados.
    mostrarTransiciones(); // Actualiza la visualización de las transiciones.
}

// Función para agregar una nueva transición cuando se hace clic en el botón de agregar.
document.getElementById('agregarTransicionBtn').addEventListener('click', function() {
    const estadoOrigen = document.getElementById('transicionOrigen').value.trim();
    const simbolo = document.getElementById('transicionSimbolo').value.trim();
    const estadoDestino = document.getElementById('transicionDestino').value.trim();

    if (estadoOrigen && simbolo && estadoDestino) {
        const transicionKey = `${estadoOrigen},${simbolo}`; // Crea la clave de la transición.
        transiciones[transicionKey] = estadoDestino; // Agrega la transición a la lista.

        // Limpia los campos de entrada.
        document.getElementById('transicionOrigen').value = '';
        document.getElementById('transicionSimbolo').value = '';
        document.getElementById('transicionDestino').value = '';

        const existingEdge = cy.edges().filter(edge => {
            return edge.data('source') === estadoOrigen && edge.data('target') === estadoDestino;
        });

        // Si ya existe una arista entre los dos estados, actualiza la etiqueta.
        if (existingEdge.length > 0) {
            const currentLabel = existingEdge.data('label');
            const newLabel = currentLabel.split(',').includes(simbolo)
                ? currentLabel
                : currentLabel + ',' + simbolo;

            existingEdge.data('label', newLabel);
        } else {
            // Si no existe, crea una nueva arista.
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

// Función para crear el autómata finito determinista (AFD).
document.getElementById('crearAfdBtn').addEventListener('click', function() {
    estado_inicial = document.getElementById('estado_inicial').value.trim(); // Obtiene el estado inicial.
    estados_finales = document.getElementById('estados_finales').value.trim().split(','); // Obtiene los estados finales.

    const afdData = {
        estados: estados,
        transiciones: transiciones,
        estado_inicial: estado_inicial,
        estados_finales: estados_finales
    };

    crearAFD(afdData); // Llama a la función que crea el AFD.
});

// Función para agregar los botones de zoom al gráfico.
function agregarBotonesZoom() {
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');

    zoomInBtn.addEventListener('click', () => {
        let currentZoom = cy.zoom();
        cy.zoom({
            level: currentZoom + 0.1,
            renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 }
        });
    });

    zoomOutBtn.addEventListener('click', () => {
        let currentZoom = cy.zoom();
        cy.zoom({
            level: currentZoom - 0.1,
            renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 }
        });
    });
}

// Función para dibujar el AFD en el grafo visual usando Cytoscape
function dibujarAFD(afdData) {
    // Guarda las posiciones existentes de los nodos para mantener la disposición al actualizar
    const posicionesExistentes = {};
    cy.nodes().forEach(node => {
        posicionesExistentes[node.id()] = node.position();
    });

    // Elimina todos los elementos existentes del grafo para reiniciar el dibujo
    cy.elements().remove();

    const estados = afdData.estados; // Obtiene los estados del AFD
    const transiciones = afdData.transiciones; // Obtiene las transiciones del AFD
    const estadoInicial = afdData.estado_inicial; // Identifica el estado inicial

    // Agrega cada estado como un nodo en el grafo
    estados.forEach(estado => {
        let posX, posY;

        // Si el estado ya existía, conserva su posición anterior
        if (posicionesExistentes[estado]) {
            posX = posicionesExistentes[estado].x;
            posY = posicionesExistentes[estado].y;
        } else {
            // Si es un nuevo estado, le asigna una posición aleatoria
            posX = Math.random() * 400;
            posY = Math.random() * 400;
        }

        // Si el estado es final, lo dibuja con un doble círculo (interno y externo)
        if (afdData.estados_finales.includes(estado)) {
            cy.add({
                group: 'nodes',
                data: { id: estado + '_externo', label: '' }, // Nodo externo vacío
                classes: 'estado-final-externo',
                position: { x: posX, y: posY }
            });

            cy.add({
                group: 'nodes',
                data: { id: estado, label: estado }, // Nodo interno con la etiqueta del estado
                classes: 'estado-final',
                position: { x: posX, y: posY }
            });

            // Sincroniza las posiciones del nodo interno y externo (estado final)
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
            // Si no es un estado final, lo agrega como un nodo normal
            cy.add({
                group: 'nodes',
                data: { id: estado, label: estado },
                position: { x: posX, y: posY }
            });
        }
    });

    // Agrega un nodo ficticio para dibujar la flecha que indica el estado inicial
    cy.add({
        group: 'nodes',
        data: { id: 'ficticio', label: '' },
        position: { x: 50, y: 50 }
    });

    // Dibuja una flecha desde el nodo ficticio hasta el estado inicial
    cy.add({
        group: 'edges',
        data: {
            source: 'ficticio',
            target: estadoInicial + (afdData.estados_finales.includes(estadoInicial) ? '_externo' : ''),
            label: '',
        },
        classes: 'flecha-inicial'
    });

    // Agrupa las transiciones que van del mismo estado origen al mismo destino
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

    // Dibuja las transiciones en el grafo
    Object.keys(transicionesAgrupadas).forEach(key => {
        const [origen, destino] = key.split('->');
        const simbolos = transicionesAgrupadas[key].join(',');

        // Si el origen o destino es un estado final, apunta al nodo externo
        const origenExterno = afdData.estados_finales.includes(origen.trim()) ? origen.trim() + '_externo' : origen.trim();
        const destinoExterno = afdData.estados_finales.includes(destino.trim()) ? destino.trim() + '_externo' : destino.trim();

        // Agrega la transición como una arista entre los nodos
        cy.add({
            group: 'edges',
            data: {
                source: origenExterno,
                target: destinoExterno,
                label: simbolos,
            }
        });
    });

    // Aplica un diseño 'preset' para mantener las posiciones de los nodos
    cy.layout({ name: 'preset' }).run();
}

// Función para crear un AFD a partir de los datos ingresados por el usuario
async function crearAFD() {
    const estado_inicial = document.getElementById('estado_inicial').value;
    const estados_finales = document.getElementById('estados_finales').value.split(',');

    const afdData = {
        estados: estados, // Lista de estados
        alfabeto: [...new Set(Object.keys(transiciones).map(k => k.split(',')[1]))], // Alfabeto basado en las transiciones
        transiciones: transiciones, // Mapa de transiciones
        estado_inicial: estado_inicial, // Estado inicial
        estados_finales: estados_finales // Estados finales
    };

    // Envía los datos del AFD al servidor para crearlo
    const response = await fetch('/create_afd', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(afdData)
    });

    const data = await response.json();
    alert(data.message); // Muestra el mensaje de respuesta
    dibujarAFD(afdData); // Dibuja el AFD en el grafo
    mostrarAFD(); // Muestra la gramática del AFD
}

// Función para evaluar una cadena en el AFD
async function evaluarCadena() {
    const cadena = document.getElementById('cadena').value;

    const response = await fetch('/evaluate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cadena: cadena }) // Envía la cadena al servidor
    });

    const data = await response.json();
    const recorrido = data.recorrido; // Recorrido del autómata

    resaltarRecorrido(recorrido); // Resalta el recorrido en el grafo

    setTimeout(() => {
        alert(data.resultado ? 'Cadena aceptada' : 'Cadena rechazada'); // Muestra el resultado
    }, recorrido.length * 1000 + 500); // Calcula el tiempo de espera basado en el largo del recorrido
}

// Resalta el recorrido de la cadena en el grafo, resaltando cada estado en secuencia
function resaltarRecorrido(recorrido) {
    cy.elements().removeClass('estado-actual'); // Elimina cualquier resaltado previo
    
    recorrido.forEach((estado, index) => {
        setTimeout(() => {
            if (index > 0) {
                cy.getElementById(recorrido[index - 1]).removeClass('estado-actual'); // Elimina el resaltado del estado anterior
            }
            cy.getElementById(estado).addClass('estado-actual'); // Resalta el estado actual
        }, index * 1000); // Aplica un retardo para el efecto de recorrido
    });
}

// Función para mostrar los datos del AFD en formato de gramática
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
        document.getElementById('afd_gramatica').innerHTML = gramaticaHtml; // Muestra la gramática en el HTML
    } else {
        const errorData = await response.json();
        alert(errorData.message); // Muestra un mensaje de error si la respuesta falla
    }
}

// Función para agregar un estado a la lista de estados
function agregarEstado() {
    const estado = document.getElementById('estado').value.trim();
    if (estado && !estados.includes(estado)) {
        estados.push(estado); // Agrega el estado a la lista si no existe
        mostrarEstados(); // Muestra la lista de estados actualizada
    }
    document.getElementById('estado').value = ''; // Limpia el campo de entrada
}

// Muestra los estados actuales en la interfaz
function mostrarEstados() {
    const listaEstados = document.getElementById('lista-estados');
    listaEstados.innerHTML = estados.join(', '); // Actualiza la lista de estados
}

// Función para agregar una transición a la lista de transiciones
function agregarTransicion() {
    const origen = document.getElementById('estado_origen').value.trim();
    const simbolo = document.getElementById('simbolo').value.trim();
    const destino = document.getElementById('estado_destino').value.trim();
    
    if (origen && simbolo && destino) {
        const transicionKey = `${origen},${simbolo}`; // Crea una clave única para la transición
        transiciones[transicionKey] = destino; // Asocia el destino con la clave de transición
        mostrarTransiciones(); // Muestra la lista de transiciones actualizada
    }
    document.getElementById('estado_origen').value = ''; // Limpia los campos de entrada
    document.getElementById('simbolo').value = '';
    document.getElementById('estado_destino').value = '';
}

// Muestra las transiciones actuales en la interfaz
function mostrarTransiciones() {
    const listaTransiciones = document.getElementById('lista-transiciones');
    listaTransiciones.innerHTML = Object.keys(transiciones)
        .map(key => `${key} -> ${transiciones[key]}`) // Muestra cada transición en formato 'origen,simbolo -> destino'
        .join('<br>');
}

// Inicializa las funciones al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    inicializarCytoscape(); // Inicializa el grafo
    agregarBotonesZoom(); // Agrega los botones de zoom para el grafo
});