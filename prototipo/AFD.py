import tkinter as tk
from tkinter import messagebox
import math

# Clase para definir un Autómata Finito Determinista (AFD)
class AFD:
    # Constructor que inicializa los componentes de un AFD
    def __init__(self, estados, alfabeto, transiciones, estado_inicial, estados_finales):
        self.estados = estados  # Lista de estados
        self.alfabeto = alfabeto  # Lista del alfabeto (símbolos)
        self.transiciones = transiciones  # Diccionario con las transiciones del AFD
        self.estado_inicial = estado_inicial  # Estado inicial
        self.estados_finales = estados_finales  # Lista de estados finales

    # Método para evaluar una cadena de entrada paso a paso
    def evaluar_cadena_paso_a_paso(self, cadena):
        estado_actual = self.estado_inicial  # Iniciar con el estado inicial
        recorrido = [estado_actual]  # Lista para registrar los estados recorridos

        # Iterar sobre cada símbolo en la cadena
        for simbolo in cadena:
            # Verificar si la transición para el estado actual y símbolo existe
            if (estado_actual, simbolo) in self.transiciones:
                estado_actual = self.transiciones[(estado_actual, simbolo)]  # Actualizar estado
                recorrido.append(estado_actual)  # Agregar el estado al recorrido
            else:
                # Si no se encuentra una transición, mostrar mensaje de error y retornar falso
                print(f"Transición no encontrada para ({estado_actual}, {simbolo})")
                return False, recorrido
        
        # Imprimir el estado final alcanzado y verificar si es un estado final
        print(f"Estado final alcanzado: {estado_actual}")
        return estado_actual in self.estados_finales, recorrido  # Retornar resultado y el recorrido

# Clase que define la interfaz gráfica para interactuar con el AFD
class AFDApp:
    # Constructor que inicializa la interfaz gráfica
    def __init__(self, root):
        self.root = root
        self.root.title("Creación de Autómata Finito Determinista (AFD)")
        self.afd = None  # Inicialmente, el AFD está vacío
        self.estado_circulos = {}  # Diccionario para almacenar los círculos de los estados
        self.estado_doble_circulos = {}  # Diccionario para almacenar los círculos dobles (estados finales)
        self.estado_lineas = {}  # Diccionario para almacenar las líneas (transiciones)
        self.flecha_inicial = None  # Flecha que indica el estado inicial
        self.canvas = tk.Canvas(self.root, width=600, height=400, bg="white")  # Crear área de dibujo
        self.canvas.grid(row=0, column=2, rowspan=8)  # Posicionar el área de dibujo en la interfaz

        self.create_widgets()  # Llamar al método que crea los widgets

    # Método para crear los componentes de la interfaz gráfica
    def create_widgets(self):
        # Crear etiquetas y campos de entrada para los estados
        tk.Label(self.root, text="Estados (separados por comas):").grid(row=0, column=0)
        self.estados_entry = tk.Entry(self.root)  # Campo de entrada para los estados
        self.estados_entry.grid(row=0, column=1)

        # Crear etiquetas y campos de entrada para el alfabeto
        tk.Label(self.root, text="Alfabeto (separado por comas):").grid(row=1, column=0)
        self.alfabeto_entry = tk.Entry(self.root)  # Campo de entrada para el alfabeto
        self.alfabeto_entry.grid(row=1, column=1)

        # Crear etiquetas y campos de texto para las transiciones
        tk.Label(self.root, text="Transiciones (formato: estado,simbolo -> estado_destino):").grid(row=2, column=0)
        self.transiciones_text = tk.Text(self.root, height=5, width=40)  # Campo de texto para las transiciones
        self.transiciones_text.grid(row=2, column=1)

        # Crear etiquetas y campos de entrada para el estado inicial
        tk.Label(self.root, text="Estado inicial:").grid(row=3, column=0)
        self.estado_inicial_entry = tk.Entry(self.root)  # Campo de entrada para el estado inicial
        self.estado_inicial_entry.grid(row=3, column=1)

        # Crear etiquetas y campos de entrada para los estados finales
        tk.Label(self.root, text="Estados finales (separados por comas):").grid(row=4, column=0)
        self.estados_finales_entry = tk.Entry(self.root)  # Campo de entrada para los estados finales
        self.estados_finales_entry.grid(row=4, column=1)

        # Botón para crear el AFD con los datos proporcionados
        self.create_button = tk.Button(self.root, text="Crear AFD", command=self.create_afd)
        self.create_button.grid(row=5, column=0, columnspan=2)

        # Crear etiquetas y campos de entrada para la evaluación de cadenas
        self.eval_label = tk.Label(self.root, text="Cadena para evaluar:")
        self.eval_label.grid(row=6, column=0)

        self.eval_entry = tk.Entry(self.root)  # Campo de entrada para la cadena a evaluar
        self.eval_entry.grid(row=6, column=1)

        # Botón para evaluar la cadena proporcionada
        self.eval_button = tk.Button(self.root, text="Evaluar Cadena", command=self.evaluate_cadena)
        self.eval_button.grid(row=7, column=0, columnspan=2)

    # Método para crear un AFD a partir de los datos ingresados en la interfaz
    def create_afd(self):
        # Obtener y procesar los estados, alfabeto y transiciones desde los campos de entrada
        estados = [estado.strip() for estado in self.estados_entry.get().split(",")]
        alfabeto = [simbolo.strip() for simbolo in self.alfabeto_entry.get().split(",")]
        transiciones = {}
        transiciones_text = self.transiciones_text.get("1.0", tk.END).strip().split("\n")  # Obtener transiciones
        
        # Iterar sobre las transiciones ingresadas en el formato texto
        for transicion in transiciones_text:
            # Dividir la transición en origen y destino usando '->' como separador
            partes = transicion.split("->")
            if len(partes) != 2:
                continue  # Continuar si la transición no está en el formato correcto
            
            # Dividir la parte izquierda (origen, símbolo) usando ',' como separador
            origen_simbolo = partes[0].split(",")
            if len(origen_simbolo) != 2:
                continue  # Continuar si el origen y símbolo no están en el formato correcto

            # Extraer el estado de origen y el símbolo de transición
            origen_estado = origen_simbolo[0].strip()  # Limpiar espacios
            simbolo = origen_simbolo[1].strip()  # Limpiar espacios

            # Extraer el estado de destino
            destino = partes[1].strip()

            # Si la transición (origen, símbolo) no existe, agregarla al diccionario de transiciones
            if (origen_estado, simbolo) not in transiciones:
                transiciones[(origen_estado, simbolo)] = destino

        # Obtener el estado inicial del campo de entrada
        estado_inicial = self.estado_inicial_entry.get().strip()

        # Obtener los estados finales, separados por comas y limpiando espacios
        estados_finales = [estado.strip() for estado in self.estados_finales_entry.get().split(",")]

        # Crear el AFD con los datos ingresados
        self.afd = AFD(estados, alfabeto, transiciones, estado_inicial, estados_finales)

        # Dibujar el AFD en el canvas
        self.dibujar_afd()

    # Método para dibujar el AFD en el canvas
    def dibujar_afd(self):
        # Limpiar el canvas antes de dibujar
        self.canvas.delete("all")
        radio = 30  # Radio de los círculos de los estados
        distancia = 150  # Distancia entre los estados
        margen = 50  # Margen inicial

        self.estado_lineas = {}  # Diccionario para almacenar las líneas de transiciones

        # Dibujar los estados
        for i, estado in enumerate(self.afd.estados):
            # Calcular la posición de cada estado en la cuadrícula
            x = margen + (i % 3) * distancia
            y = margen + (i // 3) * distancia
            # Dibujar el círculo para el estado
            circulo = self.canvas.create_oval(x - radio, y - radio, x + radio, y + radio, fill="lightblue", tags="estado")
            # Dibujar el nombre del estado dentro del círculo
            texto = self.canvas.create_text(x, y, text=estado, tags="estado_texto")
            # Almacenar los elementos gráficos en un diccionario
            self.estado_circulos[estado] = (circulo, texto)

            # Si el estado es final, dibujar un doble círculo
            if estado in self.afd.estados_finales:
                doble_circulo = self.canvas.create_oval(x - radio + 5, y - radio + 5, x + radio - 5, y + radio - 5, outline="black", width=2, tags="estado_final")
                self.estado_doble_circulos[estado] = doble_circulo

            # Agregar eventos para mover los estados
            self.canvas.tag_bind(circulo, "<ButtonPress-1>", self.on_estado_press)
            self.canvas.tag_bind(circulo, "<B1-Motion>", self.on_estado_drag)
            self.canvas.tag_bind(texto, "<ButtonPress-1>", self.on_estado_press)
            self.canvas.tag_bind(texto, "<B1-Motion>", self.on_estado_drag)

        # Dibujar la flecha que indica el estado inicial
        if self.afd.estado_inicial in self.estado_circulos:
            x_inicial, y_inicial = self._obtener_coordenadas_circulo(self.afd.estado_inicial)
            self.flecha_inicial = self.canvas.create_line(x_inicial - radio - 20, y_inicial, x_inicial - radio, y_inicial, arrow=tk.LAST, tags="inicial")

        transiciones_vistas = {}  # Diccionario para transiciones ya procesadas

        # Dibujar las transiciones entre los estados
        for (origen, simbolo), destino in self.afd.transiciones.items():
            if origen == destino:
                # Dibujar bucles para transiciones de un estado a sí mismo
                self._dibujar_bucle(origen, simbolo)
            else:
                # Almacenar las transiciones múltiples entre el mismo par de estados
                if (origen, destino) not in transiciones_vistas:
                    transiciones_vistas[(origen, destino)] = []
                transiciones_vistas[(origen, destino)].append(simbolo)

        # Dibujar las transiciones múltiples entre dos estados
        for (origen, destino), simbolos in transiciones_vistas.items():
            if origen != destino:
                self._dibujar_transicion_multiple(origen, destino, simbolos)

    # Método para dibujar un bucle (transición de un estado a sí mismo)
    def _dibujar_bucle(self, estado, simbolo):
        """Dibuja un bucle (transición a sí mismo) para un estado"""
        # Obtener las coordenadas del estado en el canvas
        x, y = self._obtener_coordenadas_circulo(estado)
        radio = 30  # Radio del bucle
        # Dibujar el arco que representa el bucle
        bucle = self.canvas.create_arc(x - radio, y - 2 * radio, x + radio, y, start=0, extent=270, style=tk.ARC, tags="transicion")
        # Dibujar el símbolo asociado a la transición dentro del bucle
        texto = self.canvas.create_text(x, y - 2 * radio, text=simbolo, tags="transicion_texto")
        # Almacenar el bucle y el texto en un diccionario
        self.estado_lineas[(estado, estado)] = (bucle, texto)

    # Método para dibujar una transición entre dos estados con múltiples símbolos
    def _dibujar_transicion_multiple(self, origen, destino, simbolos):
        """Dibuja una transición entre dos estados con múltiples símbolos"""
        # Obtener las coordenadas de los estados de origen y destino
        x1, y1 = self._obtener_coordenadas_circulo(origen)
        x2, y2 = self._obtener_coordenadas_circulo(destino)
        # Dibujar la línea de la transición
        linea = self.canvas.create_line(x1, y1, x2, y2, arrow=tk.LAST, tags="transicion")
        
        # Calcular el punto medio de la línea para posicionar el texto de los símbolos
        mid_x, mid_y = (x1 + x2) / 2, (y1 + y2) / 2
        texto = self.canvas.create_text(mid_x, mid_y - 10, text=",".join(simbolos), tags="transicion_texto")
        # Almacenar la línea y el texto en un diccionario
        self.estado_lineas[(origen, destino)] = (linea, texto)

    # Método que se ejecuta cuando se presiona sobre un estado
    def on_estado_press(self, event):
        widget = event.widget
        # Almacenar el item seleccionado y sus coordenadas
        self.selected_item = widget.find_withtag("current")[0]
        self.selected_item_coords = (event.x, event.y)

    # Método que se ejecuta al arrastrar un estado en el canvas
    def on_estado_drag(self, event):
        # Calcular el cambio en las coordenadas desde la última posición del estado
        dx = event.x - self.selected_item_coords[0]
        dy = event.y - self.selected_item_coords[1]
        # Mover el estado seleccionado en el canvas
        self.canvas.move(self.selected_item, dx, dy)
        # Actualizar las coordenadas del estado seleccionado
        self.selected_item_coords = (event.x, event.y)

        # Obtener el estado asociado al item arrastrado
        estado = self._get_estado_from_item(self.selected_item)
        if estado:
            # Obtener los elementos gráficos del estado (círculo y texto)
            circulo, texto = self.estado_circulos[estado]
            # Si el item arrastrado es el círculo, mover también el texto
            if self.selected_item == circulo:
                self.canvas.move(texto, dx, dy)
            # Si el item arrastrado es el texto, mover también el círculo
            elif self.selected_item == texto:
                self.canvas.move(circulo, dx, dy)

            # Si el estado tiene un doble círculo (es final), mover también ese círculo
            if estado in self.estado_doble_circulos:
                doble_circulo = self.estado_doble_circulos[estado]
                self.canvas.move(doble_circulo, dx, dy)

            # Si el estado es el estado inicial, actualizar la posición de la flecha inicial
            if estado == self.afd.estado_inicial:
                x_inicial, y_inicial = self._obtener_coordenadas_circulo(self.afd.estado_inicial)
                self.canvas.coords(self.flecha_inicial, x_inicial - 50, y_inicial, x_inicial - 20, y_inicial)

        # Actualizar las posiciones de las transiciones después de mover el estado
        self.actualizar_transiciones()

    # Método para actualizar las posiciones de las transiciones al mover los estados
    def actualizar_transiciones(self):
        """Actualiza la posición de las transiciones al mover los estados"""
        # Iterar sobre todas las transiciones dibujadas
        for (origen, destino), (linea, texto) in self.estado_lineas.items():
            if origen == destino:
                # Actualizar la posición del bucle si la transición es hacia el mismo estado
                self._actualizar_bucle(origen)
            else:
                # Obtener las coordenadas de los estados de origen y destino
                x1, y1 = self._obtener_coordenadas_circulo(origen)
                x2, y2 = self._obtener_coordenadas_circulo(destino)
                # Actualizar la línea de la transición
                self.canvas.coords(linea, x1, y1, x2, y2)
                # Calcular el punto medio y actualizar la posición del texto de la transición
                mid_x, mid_y = (x1 + x2) / 2, (y1 + y2) / 2
                self.canvas.coords(texto, mid_x, mid_y - 10)

    # Método para actualizar la posición del bucle (transición a sí mismo) al mover un estado
    def _actualizar_bucle(self, estado):
        """Actualiza la posición del bucle de un estado (transición a sí mismo)"""
        # Obtener las coordenadas del círculo del estado
        x, y = self._obtener_coordenadas_circulo(estado)
        radio = 30  # Radio del bucle
        # Obtener los elementos gráficos del bucle y el texto
        bucle, texto = self.estado_lineas[(estado, estado)]
        # Actualizar la posición del bucle en el canvas
        self.canvas.coords(bucle, x - radio, y - 2 * radio, x + radio, y)
        # Actualizar la posición del texto del bucle
        self.canvas.coords(texto, x, y - 2 * radio)

    # Método para obtener las coordenadas del centro del círculo que representa un estado
    def _obtener_coordenadas_circulo(self, estado):
        """Obtiene las coordenadas del centro del círculo que representa un estado"""
        # Obtener las coordenadas del rectángulo que define el círculo
        x0, y0, x1, y1 = self.canvas.coords(self.estado_circulos[estado][0])
        # Calcular y retornar el punto medio del rectángulo (centro del círculo)
        return (x0 + x1) / 2, (y0 + y1) / 2

    # Método para obtener el estado correspondiente a un item seleccionado en el canvas
    def _get_estado_from_item(self, item):
        """Encuentra el estado al que pertenece el item del canvas seleccionado"""
        # Iterar sobre todos los estados y sus elementos gráficos (círculo, texto)
        for estado, (circulo, texto) in self.estado_circulos.items():
            # Retornar el estado si el item seleccionado es su círculo o su texto
            if item == circulo or item == texto:
                return estado
        return None  # Retornar None si no se encuentra el estado

    # Método para evaluar una cadena en el AFD
    def evaluate_cadena(self):
        # Obtener la cadena ingresada en el campo de texto
        cadena = self.eval_entry.get().strip()
        if self.afd:
            # Evaluar la cadena y almacenar el recorrido paso a paso
            self.recorrido = self.afd.evaluar_cadena_paso_a_paso(cadena)[1]
            self.paso_actual = 0  # Inicializar el paso actual en 0
            self.resaltar_paso()  # Iniciar la animación de resaltado de pasos
        else:
            # Mostrar una advertencia si no se ha creado el AFD
            messagebox.showwarning("Error", "Primero crea un AFD.")

    # Método para resaltar cada paso del recorrido en el canvas
    def resaltar_paso(self):
        if self.paso_actual > 0:
            # Desactivar el resaltado del estado anterior
            estado_anterior = self.recorrido[self.paso_actual - 1]
            circulo_anterior, _ = self.estado_circulos[estado_anterior]
            self.canvas.itemconfig(circulo_anterior, fill="grey")

        if self.paso_actual < len(self.recorrido):
            # Resaltar el estado actual
            estado_actual = self.recorrido[self.paso_actual]
            circulo_actual, _ = self.estado_circulos[estado_actual]
            if self.paso_actual == len(self.recorrido) - 1 and estado_actual in self.afd.estados_finales:
                # Si es el último estado y es un estado final, resaltarlo en verde
                self.canvas.itemconfig(circulo_actual, fill="#39FF14")
            else:
                # Si no, resaltarlo en amarillo
                self.canvas.itemconfig(circulo_actual, fill="yellow")
            self.paso_actual += 1  # Avanzar al siguiente paso
            # Repetir el proceso después de 1 segundo
            self.root.after(1000, self.resaltar_paso)
        else:
            # Si se han resaltado todos los pasos, mostrar el resultado
            ultimo_estado = self.recorrido[-1]
            resultado = ultimo_estado in self.afd.estados_finales
            messagebox.showinfo("Resultado", f"Cadena {'aceptada' if resultado else 'rechazada'}. Último estado: {ultimo_estado}")

# Bloque principal que ejecuta la aplicación de Tkinter
if __name__ == "__main__":
    root = tk.Tk()  # Crear la ventana principal de Tkinter
    app = AFDApp(root)  # Crear una instancia de la aplicación
    root.mainloop()  # Ejecutar el loop principal de la aplicación