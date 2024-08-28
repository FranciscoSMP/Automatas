import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

const AFDVisualizer = ({ afdData }) => {
    const cyRef = useRef(null);

    useEffect(() => {
        const finalStatesSet = new Set(afdData.finalStates);

        const cy = cytoscape({
            container: cyRef.current,
            elements: [
                // Crear nodos
                ...afdData.states.map(state => ({
                    data: { id: state },
                    classes: finalStatesSet.has(state) ? 'final' : ''
                })),
                // Crear aristas
                ...afdData.transitions.map(trans => {
                    const [from, symbolTo] = trans.split(',');
                    const [symbol, to] = symbolTo.split('->');
                    return {
                        data: { id: `${from}-${to}`, source: from, target: to, label: symbol }
                    };
                })
            ],
            style: [
                {
                    selector: 'node',
                    style: {
                        'label': 'data(id)', // Mostrar el estado (id) en el nodo
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'background-color': '#666',
                        'color': '#fff',
                        'text-outline-width': 1,
                        'text-outline-color': '#666',
                        'font-size': '14px',
                        'width': 40,
                        'height': 40,
                    }
                },
                {
                    selector: 'node.final', // Estados finales
                    style: {
                        'border-width': 4, // Doble borde para estado final
                        'border-color': '#F00', // Color del borde
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'label': 'data(label)', // Mostrar el símbolo de transición
                        'width': 3,
                        'line-color': '#ccc',
                        'target-arrow-color': '#ccc',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier', // Hacer las aristas curvas
                    }
                }
            ],
            layout: {
                name: 'cose', // Layout automático (opción: grid o cose)
                animate: true, // Animación suave al cargar
                padding: 30
            }
        });

        return () => {
            cy.destroy(); // Limpiar la instancia de cytoscape al desmontar el componente
        };
    }, [afdData]);

    return <div ref={cyRef} style={{ width: '100%', height: '400px' }} />;
};

export default AFDVisualizer;
