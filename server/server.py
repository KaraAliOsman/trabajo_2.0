import asyncio
import websockets
import json
import logging

logging.basicConfig(level=logging.INFO)
CONNECTED_CLIENTS = set()

async def register(ws):
    CONNECTED_CLIENTS.add(ws)
    logging.info(f"Cliente conectado: {ws.remote_address} (Total: {len(CONNECTED_CLIENTS)})")

async def unregister(ws):
    CONNECTED_CLIENTS.remove(ws)
    logging.info(f"Cliente desconectado: {ws.remote_address} (Total: {len(CONNECTED_CLIENTS)})")

async def broadcast(message, sender_ws):
    if not CONNECTED_CLIENTS:
        return
    
    tasks = [client.send(message) for client in CONNECTED_CLIENTS if client != sender_ws]
    if tasks:
        #
        # --- ESTA ES LA LÍNEA QUE CAMBIÓ ---
        #
        await asyncio.gather(*tasks)

async def connection_handler(ws):
    await register(ws)
    try:
        async for message in ws:
            try:
                data = json.loads(message)
                await broadcast(message, ws)
            except json.JSONDecodeError:
                logging.error(f"JSON inválido: {message}")
            except Exception as e:
                logging.error(f"Error procesando: {e}")
                
    except websockets.exceptions.ConnectionClosedError:
        logging.info(f"Conexión cerrada abruptamente.")
    finally:
        await unregister(ws)

async def main():
    host = "localhost"
    port = 8765
    logging.info(f"Servidor iniciado en ws://localhost:{port}")
    
    async with websockets.serve(connection_handler, host, port):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())