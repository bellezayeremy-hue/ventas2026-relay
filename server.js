<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Ver pantalla - Pon el código</title>
<style>
  body { background: #0b2a4a; color: white; font-family: Arial; text-align: center; margin: 0; padding: 20px; }
  #status { color: yellow; font-weight: bold; margin: 10px; }
  input { font-size: 20px; padding: 10px; width: 180px; text-align: center; }
  button { font-size: 20px; padding: 10px 20px; cursor: pointer; }
  #pantalla { width: 90%; max-width: 900px; margin-top: 15px; border: 2px solid white; background: black; min-height: 300px; }
  #contador { margin-top: 10px; color: lightgreen; font-weight: bold; }
</style>
</head>
<body>
  <h1>Ver pantalla - Pon el código</h1>
  <div id="status">Conectando a Render...</div>
  <input id="codigo" placeholder="Ej: 754666" maxlength="6">
  <button onclick="entrar()">Ver</button>
  <br>
  <img id="pantalla">
  <div id="contador">Imágenes recibidas: 0</div>

<script>
  let ws;
  let codigoActual = "";
  let imagenes = 0;
  const status = document.getElementById('status');
  const img = document.getElementById('pantalla');
  const contador = document.getElementById('contador');

  function conectar() {
    ws = new WebSocket('wss://ventas2026-relay.onrender.com');
    ws.binaryType = 'blob';

    ws.onopen = () => {
      status.textContent = 'Conectado a Render! Pon el código y dale a Ver';
      status.style.color = 'lightgreen';
    };

    ws.onmessage = async (event) => {
      // Si es texto, es solo un aviso, no es foto
      if (typeof event.data === 'string') {
        console.log('Texto:', event.data);
        return;
      }

      // Si es foto, viene como Blob o ArrayBuffer, las 2 formas las mostramos
      try {
        let blob;
        if (event.data instanceof Blob) {
          blob = event.data;
        } else {
          blob = new Blob([event.data], { type: 'image/jpeg' });
        }
        const url = URL.createObjectURL(blob);
        img.src = url;
        imagenes++;
        contador.textContent = 'Imágenes recibidas: ' + imagenes;
        status.textContent = '¡SÍ está llegando! Código: ' + codigoActual;
        status.style.color = 'lightgreen';
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      } catch (e) { console.log(e); }
    };

    ws.onclose = () => {
      status.textContent = 'Se desconectó, reconectando...';
      setTimeout(conectar, 2000);
    };
  }

  function entrar() {
    codigoActual = document.getElementById('codigo').value.trim();
    if (codigoActual.length !== 6) {
      alert('Pon el código de 6 números que sale en el celular');
      return;
    }
    ws.send(JSON.stringify({ type: 'join', code: codigoActual, role: 'viewer' }));
    status.textContent = 'Te uniste al código ' + codigoActual + ', esperando imagen...';
  }

  conectar();
</script>
</body>
</html>
