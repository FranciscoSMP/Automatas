from flask import Flask, request, jsonify, render_template

# Crear una instancia de la aplicación Flask
app = Flask(__name__)

# Clase que representa un Autómata Finito Determinista (AFD)
class AFD:
    def __init__(self, estados, alfabeto, transiciones, estado_inicial, estados_finales):
        # Inicializar los atributos del AFD
        self.estados = estados  # Conjunto de estados del AFD
        self.alfabeto = alfabeto  # Conjunto del alfabeto del AFD
        self.transiciones = transiciones  # Función de transición (mapea (estado, símbolo) -> nuevo estado)
        self.estado_inicial = estado_inicial  # Estado inicial del AFD
        self.estados_finales = estados_finales  # Conjunto de estados finales (de aceptación)

    # Método para evaluar una cadena en el AFD
    def evaluar_cadena(self, cadena):
        estado_actual = self.estado_inicial  # Comenzar en el estado inicial
        recorrido = [estado_actual]  # Lista para guardar el recorrido de estados

        # Iterar sobre cada símbolo de la cadena
        for simbolo in cadena:
            # Verificar si el símbolo está en el alfabeto
            if simbolo not in self.alfabeto:
                print(f"El símbolo {simbolo} no está en el alfabeto")
                return False, recorrido  # Si no está en el alfabeto, retornar False

            # Verificar si existe una transición para el par (estado_actual, símbolo)
            if f"{estado_actual},{simbolo}" in self.transiciones:
                # Actualizar el estado actual con el nuevo estado al que transita
                estado_actual = self.transiciones[f"{estado_actual},{simbolo}"]
                recorrido.append(estado_actual)  # Añadir el nuevo estado al recorrido
            else:
                # Si no hay transición definida, la cadena no es aceptada
                print(f"Transición no encontrada para ({estado_actual}, {simbolo})")
                return False, recorrido

        # Verificar si el estado actual es un estado de aceptación
        es_aceptada = estado_actual in self.estados_finales
        return es_aceptada, recorrido  # Retornar si la cadena es aceptada y el recorrido

# Variable global para almacenar el AFD creado
afd = None

# Ruta de la página principal
@app.route('/')
def index():
    # Renderizar la plantilla HTML 'index.html'
    return render_template('index.html')

# Ruta para crear un AFD
@app.route('/create_afd', methods=['POST'])
def create_afd():
    global afd  # Indicar que se va a modificar la variable global afd
    data = request.json  # Obtener los datos en formato JSON del cliente
    # Extraer los componentes del AFD a partir de los datos recibidos
    estados = data['estados']
    alfabeto = data['alfabeto']
    transiciones = data['transiciones']
    estado_inicial = data['estado_inicial']
    estados_finales = data['estados_finales']

    # Crear una nueva instancia de AFD con los datos recibidos
    afd = AFD(estados, alfabeto, transiciones, estado_inicial, estados_finales)
    # Retornar una respuesta indicando que el AFD fue creado con éxito
    return jsonify({"message": "AFD creado exitosamente"}), 200

# Ruta para evaluar una cadena en el AFD
@app.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.get_json()  # Obtener los datos JSON de la solicitud
    cadena = data['cadena']  # Extraer la cadena a evaluar

    # Verificar si ya se ha creado un AFD
    if afd:
        # Evaluar la cadena en el AFD y obtener el resultado y recorrido
        resultado, recorrido = afd.evaluar_cadena(cadena)
        # Retornar el resultado de la evaluación y el recorrido de estados
        return jsonify({"resultado": resultado, "recorrido": recorrido})
    else:
        # Si no hay AFD creado, devolver un mensaje de error
        return jsonify({"resultado": False, "message": "Primero crea el AFD"})

# Ruta para obtener la información del AFD actual
@app.route('/get_afd', methods=['GET'])
def get_afd():
    # Verificar si ya existe un AFD creado
    if afd:
        # Devolver la información del AFD
        afd_info = {
            "Q": afd.estados,
            "Σ": afd.alfabeto,
            "δ": afd.transiciones,
            "q0": afd.estado_inicial,
            "F": afd.estados_finales
        }
        return jsonify(afd_info), 200
    else:
        # Si no hay AFD, devolver un mensaje de error
        return jsonify({"message": "No hay AFD creado"}), 404

# Ruta para eliminar un estado del AFD
@app.route('/delete_estado', methods=['POST'])
def delete_estado():
    global afd  # Indicar que se va a modificar la variable global afd
    data = request.json  # Obtener los datos JSON de la solicitud
    estado_a_eliminar = data['estado']  # Obtener el estado que se desea eliminar

    # Verificar si hay un AFD creado
    if afd:
        # Verificar si el estado a eliminar existe en el AFD
        if estado_a_eliminar not in afd.estados:
            return jsonify({"message": "El estado no existe"}), 404

        # Eliminar el estado de la lista de estados
        afd.estados.remove(estado_a_eliminar)

        # Actualizar las transiciones para eliminar las que involucran el estado eliminado
        transiciones_actualizadas = {}
        for transicion, destino in afd.transiciones.items():
            origen, simbolo = transicion.split(',')
            if origen != estado_a_eliminar and destino != estado_a_eliminar:
                transiciones_actualizadas[transicion] = destino

        afd.transiciones = transiciones_actualizadas  # Actualizar las transiciones del AFD

        # Verificar si el estado inicial es el que se eliminó
        if afd.estado_inicial == estado_a_eliminar:
            afd.estado_inicial = None  # Si es el estado inicial, dejarlo como None

        # Verificar si el estado eliminado era un estado de aceptación
        if estado_a_eliminar in afd.estados_finales:
            afd.estados_finales.remove(estado_a_eliminar)

        # Retornar el AFD actualizado
        return jsonify({"message": "Estado eliminado correctamente", "afd": {
            "Q": afd.estados,
            "Σ": afd.alfabeto,
            "δ": afd.transiciones,
            "q0": afd.estado_inicial,
            "F": afd.estados_finales
        }}), 200
    else:
        # Si no hay AFD, devolver un mensaje de error
        return jsonify({"message": "No hay AFD creado"}), 404

# Punto de entrada de la aplicación
if __name__ == '__main__':
    app.run(debug=True)  # Ejecutar la aplicación Flask en modo debug