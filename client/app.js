window.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    
    const colorButtons = document.querySelectorAll('.color-btn');
    const clearButton = document.getElementById('clear-local-btn');

    let isDrawing = false;
    let currentColor = '#000000';
    let strokeWidth = 5; 
    let isRemoteDrawing = false; 

    const ws = new WebSocket('ws://localhost:8765');

    ws.onopen = () => {
        // <-- DEPURACIÓN 1: Confirma la conexión
        console.log('¡Conectado al servidor WebSocket! 👍');
    };

    ws.onclose = () => {
        console.log('Desconectado del servidor');
    };

    ws.onmessage = (event) => {
        // <-- DEPURACIÓN 2: Muestra CUALQUIER mensaje que llega
        console.log('===> MENSAJE RECIBIDO:', event.data);

        try {
            const data = JSON.parse(event.data);
            if (data.type === 'draw') {
                handleRemoteDraw(data);
            }
        } catch (error) {
            // <-- DEPURACIÓN 3: Muestra si el JSON que llega está malo
            console.error('Error al parsear JSON:', error, event.data);
        }
    };

    function handleRemoteDraw(data) {
        ctx.strokeStyle = data.color;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        
        if (data.isDown) {
            if (!isRemoteDrawing) {
                ctx.beginPath();
                ctx.moveTo(data.x, data.y);
                isRemoteDrawing = true;
            } else {
                ctx.lineTo(data.x, data.y);
                ctx.stroke();
            }
        } else {
            if (isRemoteDrawing) {
                isRemoteDrawing = false;
                ctx.beginPath();
            }
        }
    }
    
    function sendDrawData(x, y, isDown) {
        const message = {
            type: 'draw',
            x: x,
            y: y,
            isDown: isDown,
            color: currentColor
        };
        
        if (ws.readyState === WebSocket.OPEN) {
            // <-- DEPURACIÓN 4: Confirma que estamos ENVIANDO datos
            console.log('ENVIANDO DATOS:', JSON.stringify(message));
            ws.send(JSON.stringify(message));
        }
    }

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
        sendDrawData(e.offsetX, e.offsetY, true);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        sendDrawData(e.offsetX, e.offsetY, true);
    });

    canvas.addEventListener('mouseup', (e) => {
        if (!isDrawing) return;
        isDrawing = false;
        sendDrawData(e.offsetX, e.offsetY, false);
        ctx.beginPath();
    });

    canvas.addEventListener('mouseleave', (e) => {
        if (!isDrawing) return;
        isDrawing = false;
        sendDrawData(e.offsetX, e.offsetY, false);
        ctx.beginPath();
    });

    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.color-btn.active').classList.remove('active');
            button.classList.add('active');
            currentColor = button.dataset.color;
        });
    });

    clearButton.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
});