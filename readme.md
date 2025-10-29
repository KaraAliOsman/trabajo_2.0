# Pizarra WebSocket

Aplicación de pizarra en tiempo real con WebSocket (Python y JS).

## Instalación

1.  Se requiere Python 3.7 o superior.
2.  Instalar dependencias del servidor:

    ```bash
    pip install websockets
    ```

## Ejecución

1.  **Iniciar Servidor:**
    Navegar a la carpeta `server/` y ejecutar:
    ```bash
    python server.py
    ```
    El servidor correrá en `ws://localhost:8765`.

2.  **Abrir Cliente:**
    Abrir el archivo `client/index.html` en un navegador web. Para probar la funcionalidad multi-usuario, abrir el mismo archivo en una segunda ventana o navegador.