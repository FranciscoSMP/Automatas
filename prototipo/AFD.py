import tkinter as tk
from tkinter import messagebox
import math

class AFD:
    def __init__(self, estados, alfabeto, transiciones, estado_inicial, estados_finales):
        self.estados = estados
        self.alfabeto = alfabeto
        self.transiciones = transiciones
        self.estado_inicial = estado_inicial
        self.estados_finales = estados_finales

    def evaluar_cadena_paso_a_paso(self, cadena):
        estado_actual = self.estado_inicial
        recorrido = [estado_actual]  # Almacena los estados recorridos

        for simbolo in cadena:
            if (estado_actual, simbolo) in self.transiciones:
                estado_actual = self.transiciones[(estado_actual, simbolo)]
                recorrido.append(estado_actual)
            else:
                print(f"Transición no encontrada para ({estado_actual}, {simbolo})")
                return False, recorrido
        
        print(f"Estado final alcanzado: {estado_actual}")
        return estado_actual in self.estados_finales, recorrido

class AFDApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Creación de Autómata Finito Determinista (AFD)")
        self.afd = None
        self.estado_circulos = {}
        self.estado_doble_circulos = {}
        self.estado_lineas = {}
        self.flecha_inicial = None
        self.canvas = tk.Canvas(self.root, width=600, height=400, bg="white")
        self.canvas.grid(row=0, column=2, rowspan=8)

        self.create_widgets()

    def create_widgets(self):
        tk.Label(self.root, text="Estados (separados por comas):").grid(row=0, column=0)
        self.estados_entry = tk.Entry(self.root)
        self.estados_entry.grid(row=0, column=1)

        tk.Label(self.root, text="Alfabeto (separado por comas):").grid(row=1, column=0)
        self.alfabeto_entry = tk.Entry(self.root)
        self.alfabeto_entry.grid(row=1, column=1)

        tk.Label(self.root, text="Transiciones (formato: estado,simbolo -> estado_destino):").grid(row=2, column=0)
        self.transiciones_text = tk.Text(self.root, height=5, width=40)
        self.transiciones_text.grid(row=2, column=1)

        tk.Label(self.root, text="Estado inicial:").grid(row=3, column=0)
        self.estado_inicial_entry = tk.Entry(self.root)
        self.estado_inicial_entry.grid(row=3, column=1)

        tk.Label(self.root, text="Estados finales (separados por comas):").grid(row=4, column=0)
        self.estados_finales_entry = tk.Entry(self.root)
        self.estados_finales_entry.grid(row=4, column=1)

        self.create_button = tk.Button(self.root, text="Crear AFD", command=self.create_afd)
        self.create_button.grid(row=5, column=0, columnspan=2)

        self.eval_label = tk.Label(self.root, text="Cadena para evaluar:")
        self.eval_label.grid(row=6, column=0)

        self.eval_entry = tk.Entry(self.root)
        self.eval_entry.grid(row=6, column=1)

        self.eval_button = tk.Button(self.root, text="Evaluar Cadena", command=self.evaluate_cadena)
        self.eval_button.grid(row=7, column=0, columnspan=2)

    def create_afd(self):
        estados = [estado.strip() for estado in self.estados_entry.get().split(",")]
        alfabeto = [simbolo.strip() for simbolo in self.alfabeto_entry.get().split(",")]
        transiciones = {}
        transiciones_text = self.transiciones_text.get("1.0", tk.END).strip().split("\n")
        
        for transicion in transiciones_text:
            partes = transicion.split("->")
            if len(partes) != 2:
                continue
            origen_simbolo = partes[0].split(",")
            if len(origen_simbolo) != 2:
                continue
            origen_estado = origen_simbolo[0].strip()
            simbolo = origen_simbolo[1].strip()
            destino = partes[1].strip()
            if (origen_estado, simbolo) not in transiciones:
                transiciones[(origen_estado, simbolo)] = destino

        estado_inicial = self.estado_inicial_entry.get().strip()
        estados_finales = [estado.strip() for estado in self.estados_finales_entry.get().split(",")]

        self.afd = AFD(estados, alfabeto, transiciones, estado_inicial, estados_finales)

        # Graficar el AFD en el canvas
        self.dibujar_afd()

    def dibujar_afd(self):
        self.canvas.delete("all")
        radio = 30
        distancia = 150
        margen = 50

        # Resetea las líneas de transiciones para que se puedan actualizar correctamente
        self.estado_lineas = {}

        for i, estado in enumerate(self.afd.estados):
            x = margen + (i % 3) * distancia
            y = margen + (i // 3) * distancia
            circulo = self.canvas.create_oval(x - radio, y - radio, x + radio, y + radio, fill="lightblue", tags="estado")
            texto = self.canvas.create_text(x, y, text=estado, tags="estado_texto")
            self.estado_circulos[estado] = (circulo, texto)

            # Dibuja doble círculo para los estados finales
            if estado in self.afd.estados_finales:
                doble_circulo = self.canvas.create_oval(x - radio + 5, y - radio + 5, x + radio - 5, y + radio - 5, outline="black", width=2, tags="estado_final")
                self.estado_doble_circulos[estado] = doble_circulo

            # Vincular eventos para manipulación con el mouse
            self.canvas.tag_bind(circulo, "<ButtonPress-1>", self.on_estado_press)
            self.canvas.tag_bind(circulo, "<B1-Motion>", self.on_estado_drag)
            self.canvas.tag_bind(texto, "<ButtonPress-1>", self.on_estado_press)
            self.canvas.tag_bind(texto, "<B1-Motion>", self.on_estado_drag)

        # Dibuja la flecha inicial
        if self.afd.estado_inicial in self.estado_circulos:
            x_inicial, y_inicial = self._obtener_coordenadas_circulo(self.afd.estado_inicial)
            self.flecha_inicial = self.canvas.create_line(x_inicial - radio - 20, y_inicial, x_inicial - radio, y_inicial, arrow=tk.LAST, tags="inicial")

        # Dibujar las transiciones
        transiciones_vistas = {}
        for (origen, simbolo), destino in self.afd.transiciones.items():
            if origen == destino:
                self._dibujar_bucle(origen, simbolo)
            else:
                if (origen, destino) not in transiciones_vistas:
                    transiciones_vistas[(origen, destino)] = []
                transiciones_vistas[(origen, destino)].append(simbolo)

        for (origen, destino), simbolos in transiciones_vistas.items():
            if origen != destino:
                self._dibujar_transicion_multiple(origen, destino, simbolos)

    def _dibujar_bucle(self, estado, simbolo):
        """Dibuja un bucle (transición a sí mismo) para un estado"""
        x, y = self._obtener_coordenadas_circulo(estado)
        radio = 30
        bucle = self.canvas.create_arc(x - radio, y - 2 * radio, x + radio, y, start=0, extent=270, style=tk.ARC, tags="transicion")
        texto = self.canvas.create_text(x, y - 2 * radio, text=simbolo, tags="transicion_texto")
        self.estado_lineas[(estado, estado)] = (bucle, texto)

    def _dibujar_transicion_multiple(self, origen, destino, simbolos):
        """Dibuja una transición entre dos estados con múltiples símbolos"""
        x1, y1 = self._obtener_coordenadas_circulo(origen)
        x2, y2 = self._obtener_coordenadas_circulo(destino)
        linea = self.canvas.create_line(x1, y1, x2, y2, arrow=tk.LAST, tags="transicion")
        
        # Colocar el texto de los símbolos en el medio de la línea
        mid_x, mid_y = (x1 + x2) / 2, (y1 + y2) / 2
        texto = self.canvas.create_text(mid_x, mid_y - 10, text=",".join(simbolos), tags="transicion_texto")
        self.estado_lineas[(origen, destino)] = (linea, texto)

    def on_estado_press(self, event):
        widget = event.widget
        self.selected_item = widget.find_withtag("current")[0]
        self.selected_item_coords = (event.x, event.y)

    def on_estado_drag(self, event):
        dx = event.x - self.selected_item_coords[0]
        dy = event.y - self.selected_item_coords[1]
        self.canvas.move(self.selected_item, dx, dy)
        self.selected_item_coords = (event.x, event.y)

        # Buscar el estado asociado con el item seleccionado
        estado = self._get_estado_from_item(self.selected_item)
        if estado:
            circulo, texto = self.estado_circulos[estado]
            if self.selected_item == circulo:
                self.canvas.move(texto, dx, dy)
            elif self.selected_item == texto:
                self.canvas.move(circulo, dx, dy)

            # Mueve el doble círculo asociado
            if estado in self.estado_doble_circulos:
                doble_circulo = self.estado_doble_circulos[estado]
                self.canvas.move(doble_circulo, dx, dy)

            # Mueve la flecha inicial si es el estado inicial
            if estado == self.afd.estado_inicial:
                x_inicial, y_inicial = self._obtener_coordenadas_circulo(self.afd.estado_inicial)
                self.canvas.coords(self.flecha_inicial, x_inicial - 50, y_inicial, x_inicial - 20, y_inicial)

        # Actualiza las transiciones conectadas a este estado
        self.actualizar_transiciones()

    def actualizar_transiciones(self):
        """Actualiza la posición de las transiciones al mover los estados"""
        for (origen, destino), (linea, texto) in self.estado_lineas.items():
            if origen == destino:
                self._actualizar_bucle(origen)
            else:
                x1, y1 = self._obtener_coordenadas_circulo(origen)
                x2, y2 = self._obtener_coordenadas_circulo(destino)
                self.canvas.coords(linea, x1, y1, x2, y2)
                mid_x, mid_y = (x1 + x2) / 2, (y1 + y2) / 2
                self.canvas.coords(texto, mid_x, mid_y - 10)

    def _actualizar_bucle(self, estado):
        """Actualiza la posición del bucle de un estado (transición a sí mismo)"""
        x, y = self._obtener_coordenadas_circulo(estado)
        radio = 30
        bucle, texto = self.estado_lineas[(estado, estado)]
        self.canvas.coords(bucle, x - radio, y - 2 * radio, x + radio, y)
        self.canvas.coords(texto, x, y - 2 * radio)

    def _obtener_coordenadas_circulo(self, estado):
        """Obtiene las coordenadas del centro del círculo que representa un estado"""
        x0, y0, x1, y1 = self.canvas.coords(self.estado_circulos[estado][0])
        return (x0 + x1) / 2, (y0 + y1) / 2

    def _get_estado_from_item(self, item):
        """Encuentra el estado al que pertenece el item del canvas seleccionado"""
        for estado, (circulo, texto) in self.estado_circulos.items():
            if item == circulo or item == texto:
                return estado
        return None

    def evaluate_cadena(self):
        cadena = self.eval_entry.get().strip()
        if self.afd:
            self.recorrido = self.afd.evaluar_cadena_paso_a_paso(cadena)[1]
            self.paso_actual = 0
            self.resaltar_paso()
        else:
            messagebox.showwarning("Error", "Primero crea un AFD.")

    def resaltar_paso(self):
        if self.paso_actual > 0:
            estado_anterior = self.recorrido[self.paso_actual - 1]
            circulo_anterior, _ = self.estado_circulos[estado_anterior]
            self.canvas.itemconfig(circulo_anterior, fill="grey")

        if self.paso_actual < len(self.recorrido):
            estado_actual = self.recorrido[self.paso_actual]
            circulo_actual, _ = self.estado_circulos[estado_actual]
            if self.paso_actual == len(self.recorrido) - 1 and estado_actual in self.afd.estados_finales:
                self.canvas.itemconfig(circulo_actual, fill="#39FF14")  # Cambia a verde si es un estado final
            else:
                self.canvas.itemconfig(circulo_actual, fill="yellow")  # Cambia a amarillo si no es final
            self.paso_actual += 1
            self.root.after(1000, self.resaltar_paso)  # Retardo de 1 segundo entre cada paso
        else:
            ultimo_estado = self.recorrido[-1]
            resultado = ultimo_estado in self.afd.estados_finales
            messagebox.showinfo("Resultado", f"Cadena {'aceptada' if resultado else 'rechazada'}. Último estado: {ultimo_estado}")

if __name__ == "__main__":
    root = tk.Tk()
    app = AFDApp(root)
    root.mainloop()
