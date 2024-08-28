import React, { useState } from 'react';
import AFDForm from './components/AFDForm';
import AFDVisualizer from './components/AFDVisualizer';

function App() {
    const [afdData, setAfdData] = useState(null);

    const handleAFDSubmit = (data) => {
        setAfdData(data);
    };

    return (
        <div>
            <h1>Generador de AFD</h1>
            <AFDForm onSubmit={handleAFDSubmit} />
            {afdData && <AFDVisualizer afdData={afdData} />}
        </div>
    );
}

export default App;
