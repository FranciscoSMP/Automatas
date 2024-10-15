from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

class AFD:
    def __init__(self, estados, alfabeto, transiciones, estado_inicial, estados_finales):
        self.estados = estados
        self.alfabeto = alfabeto
        self.transiciones = transiciones
        self.estado_inicial = estado_inicial
        self.estados_finales = estados_finales

    def evaluar_cadena(self, cadena):
        estado_actual = self.estado_inicial
        recorrido = [estado_actual]  # Almacena los estados recorridos

        for simbolo in cadena:
            # Verifica que el símbolo esté en el alfabeto
            if simbolo not in self.alfabeto:
                print(f"El símbolo {simbolo} no está en el alfabeto")
                return False, recorrido

            # Verifica si existe una transición válida
            if f"{estado_actual},{simbolo}" in self.transiciones:
                estado_actual = self.transiciones[f"{estado_actual},{simbolo}"]
                recorrido.append(estado_actual)
            else:
                print(f"Transición no encontrada para ({estado_actual}, {simbolo})")
                return False, recorrido

        # Verifica si el estado actual es final
        es_aceptada = estado_actual in self.estados_finales
        return es_aceptada, recorrido

afd = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/create_afd', methods=['POST'])
def create_afd():
    global afd
    data = request.json
    estados = data['estados']
    alfabeto = data['alfabeto']
    transiciones = data['transiciones']
    estado_inicial = data['estado_inicial']
    estados_finales = data['estados_finales']

    afd = AFD(estados, alfabeto, transiciones, estado_inicial, estados_finales)
    return jsonify({"message": "AFD creado exitosamente"}), 200

@app.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.get_json()
    cadena = data['cadena']
    
    if afd:
        resultado, recorrido = afd.evaluar_cadena(cadena)
        return jsonify({"resultado": resultado, "recorrido": recorrido})
    else:
        return jsonify({"resultado": False, "message": "Primero crea el AFD"})
    
@app.route('/get_afd', methods=['GET'])
def get_afd():
    if afd:
        afd_info = {
            "Q": afd.estados,
            "Σ": afd.alfabeto,
            "δ": afd.transiciones,
            "q0": afd.estado_inicial,
            "F": afd.estados_finales
        }
        return jsonify(afd_info), 200
    else:
        return jsonify({"message": "No hay AFD creado"}), 404

@app.route('/delete_estado', methods=['POST'])
def delete_estado():
    global afd
    data = request.json
    estado_a_eliminar = data['estado']

    if afd:
        # Verificar si el estado existe en el AFD
        if estado_a_eliminar not in afd.estados:
            return jsonify({"message": "El estado no existe"}), 404

        # Eliminar el estado de la lista de estados
        afd.estados.remove(estado_a_eliminar)

        # Eliminar cualquier transición relacionada con el estado
        transiciones_actualizadas = {}
        for transicion, destino in afd.transiciones.items():
            origen, simbolo = transicion.split(',')
            if origen != estado_a_eliminar and destino != estado_a_eliminar:
                transiciones_actualizadas[transicion] = destino

        afd.transiciones = transiciones_actualizadas

        # Si el estado a eliminar es inicial o final, actualizar esos valores
        if afd.estado_inicial == estado_a_eliminar:
            afd.estado_inicial = None  # O asignar un nuevo estado inicial si lo deseas

        if estado_a_eliminar in afd.estados_finales:
            afd.estados_finales.remove(estado_a_eliminar)

        return jsonify({"message": "Estado eliminado correctamente", "afd": {
            "Q": afd.estados,
            "Σ": afd.alfabeto,
            "δ": afd.transiciones,
            "q0": afd.estado_inicial,
            "F": afd.estados_finales
        }}), 200
    else:
        return jsonify({"message": "No hay AFD creado"}), 404

if __name__ == '__main__':
    app.run(debug=True)
