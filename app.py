import graphviz

class AFD:
    def __init__(self, estados, alfabeto, transiciones, estado_inicial, estados_finales):
        self.estados = estados
        self.alfabeto = alfabeto
        self.transiciones = transiciones
        self.estado_inicial = estado_inicial
        self.estados_finales = estados_finales

    def evaluar_cadena(self, cadena):
        estado_actual = self.estado_inicial
        for simbolo in cadena:
            if simbolo in self.alfabeto:
                estado_actual = self.transiciones.get((estado_actual, simbolo), None)
                if estado_actual is None:
                    return False
            else:
                return False
        return estado_actual in self.estados_finales

    def generar_gramatica(self):
        reglas = []
        for (estado, simbolo), estado_destino in self.transiciones.items():
            if estado_destino in self.estados_finales:
                reglas.append(f"{estado} -> {simbolo}")
            else:
                reglas.append(f"{estado} -> {simbolo} {estado_destino}")
        return reglas

    def graficar(self):
        dot = graphviz.Digraph(comment="Autómata Finito Determinista")
        for estado in self.estados:
            if estado in self.estados_finales:
                dot.node(estado, estado, shape="doublecircle")
            else:
                dot.node(estado, estado)
        
        dot.node('', '', shape='none')
        dot.edge('', self.estado_inicial)

        for (estado, simbolo), estado_destino in self.transiciones.items():
            dot.edge(estado, estado_destino, label=simbolo)
        
        dot.render('afd', format='png', cleanup=True)
        print("Autómata graficado: archivo 'afd.png' generado")

# Función principal para interactuar con el usuario
def main():
    print("Creación de un Autómata Finito Determinista (AFD)")
    
    # Ingreso del conjunto de estados
    estados = input("Ingrese los estados del AFD (separados por comas): ").split(",")
    
    # Ingreso del alfabeto
    alfabeto = input("Ingrese el alfabeto del AFD (separado por comas): ").split(",")
    
    # Ingreso de las transiciones
    print("Ingrese las transiciones (formato: estado,simbolo -> estado_destino)")
    transiciones = {}
    while True:
        transicion = input("Transición (deje vacío para terminar): ")
        if not transicion:
            break
        partes = transicion.split("->")
        origen_simbolo = partes[0].split(",")
        destino = partes[1].strip()
        transiciones[(origen_simbolo[0].strip(), origen_simbolo[1].strip())] = destino
    
    # Ingreso del estado inicial
    estado_inicial = input("Ingrese el estado inicial: ").strip()
    
    # Ingreso de los estados finales
    estados_finales = input("Ingrese los estados finales (separados por comas): ").split(",")
    
    # Creación del AFD
    afd = AFD(estados, alfabeto, transiciones, estado_inicial, estados_finales)
    
    # Visualización de la gramática generada
    print("\nGramática generada por el AFD:")
    for regla in afd.generar_gramatica():
        print(regla)

    # Graficar el AFD
    afd.graficar()

    # Evaluación de cadenas
    while True:
        cadena = input("\nIngrese una cadena para evaluar (deje vacío para terminar): ")
        if not cadena:
            break
        if afd.evaluar_cadena(cadena):
            print("Cadena aceptada.")
        else:
            print("Cadena rechazada.")

if __name__ == "__main__":
    main()