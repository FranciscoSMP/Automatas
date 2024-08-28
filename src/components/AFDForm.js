import React, { useState } from 'react';

const AFDForm = ({ onSubmit }) => {
    const [states, setStates] = useState('');
    const [alphabet, setAlphabet] = useState('');
    const [transitions, setTransitions] = useState('');
    const [initialState, setInitialState] = useState('');
    const [finalStates, setFinalStates] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const afdData = {
            states: states.split(','),
            alphabet: alphabet.split(','),
            transitions: transitions.split(';'),
            initialState,
            finalStates: finalStates.split(',')
        };
        onSubmit(afdData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>Estados:</label>
            <input type="text" value={states} onChange={(e) => setStates(e.target.value)} placeholder="q0,q1,q2" />

            <label>Alfabeto:</label>
            <input type="text" value={alphabet} onChange={(e) => setAlphabet(e.target.value)} placeholder="a,b" />

            <label>Transiciones (formato: q0,a->q1):</label>
            <input type="text" value={transitions} onChange={(e) => setTransitions(e.target.value)} placeholder="q0,a->q1;q1,b->q2" />

            <label>Estado Inicial:</label>
            <input type="text" value={initialState} onChange={(e) => setInitialState(e.target.value)} />

            <label>Estados Finales:</label>
            <input type="text" value={finalStates} onChange={(e) => setFinalStates(e.target.value)} />

            <button type="submit">Crear AFD</button>
        </form>
    );
};

export default AFDForm;
