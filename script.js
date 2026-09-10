// ATENCIÓN: PEGÁ ACÁ LA MISMA URL QUE USÁS EN LA APP INTERNA
const API_URL = 'https://script.google.com/macros/s/AKfycbyt1EWLB13nzf9W9jB-mjpU63w_1cb9QUdAm1-Zqjju5EAOMsU34LXrEU38aLc2JYKQ/exec';

// Navegación entre pestañas
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
    
    // Si entran a la galería, cargamos las fotos de la nube
    if(tabId === 'galeria') {
        cargarGaleria();
    }
}

// Enviar el Turno a Google Sheets
async function pedirTurno(e) {
    e.preventDefault();
    const btn = document.getElementById('btnPedirTurno');
    btn.innerText = "⏳ Enviando solicitud..."; 
    btn.disabled = true;

    // ¡Acá agregamos el DNI y la Patente para que viajen al Excel!
    const data = {
        accion: "guardar_turno",
        cliente: document.getElementById('t-cliente').value,
        dni: document.getElementById('t-dni').value,
        telefono: document.getElementById('t-tel').value,
        vehiculo: document.getElementById('t-vehiculo').value,
        patente: document.getElementById('t-patente').value,
        fechaTurno: document.getElementById('t-fecha').value,
        motivo: document.getElementById('t-motivo').value
    };

    try {
        await fetch(API_URL, { 
            method: 'POST', 
            mode: 'no-cors', 
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(data) 
        });
        
        alert("✅ ¡Turno solicitado con éxito! Nos comunicaremos a la brevedad.");
        e.target.reset(); // Limpia el formulario
    } catch(error) {
        alert("❌ Ocurrió un error. Por favor, intentá comunicarte por WhatsApp.");
    } finally {
        btn.innerText = "Solicitar Turno"; 
        btn.disabled = false;
    }
}

// Cargar Trabajos Reales en la Galería (FOTOS SOLUCIONADAS)
async function cargarGaleria() {
    const contenedor = document.querySelector('.gallery-grid');
    contenedor.innerHTML = '<p style="text-align:center; width: 100%;">Cargando trabajos recientes...</p>';

    try {
        const respuesta = await fetch(API_URL + "?accion=leer_historial");
        const filas = await respuesta.json();
        
        contenedor.innerHTML = ''; 
        let contador = 0;

        filas.reverse().forEach(fila => {
            if(fila[4] === 'Egreso' && fila[8] && contador < 6) { 
                const fotos = fila[8].split(','); 
                
                let htmlFotos = `<div style="display: flex; overflow-x: auto; gap: 10px; padding-bottom: 10px; scroll-snap-type: x mandatory;">`;
                fotos.forEach(url => {
                    // TRUCO DEFINITIVO: Usamos el visor de miniaturas de Google Drive
                    let urlDirecta = url;
                    const match = url.match(/\/d\/(.+?)\//);
                    if(match && match[1]) {
                        // sz=w1000 le pide a Google que nos dé la imagen visible y de buena calidad
                        urlDirecta = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
                    }
                    
                    htmlFotos += `<div style="flex: 0 0 100%; height: 250px; background-image: url('${urlDirecta}'); background-size: cover; background-position: center; border-radius: 8px 8px 0 0; scroll-snap-align: start;"></div>`;
                });
                htmlFotos += `</div>`;

                const tarjeta = document.createElement('div');
                tarjeta.className = 'gallery-card';
                tarjeta.innerHTML = `
                    ${htmlFotos}
                    <div class="gallery-info" style="padding: 15px;">
                        <div class="gallery-title" style="font-weight: bold;">${fila[2]} (Patente: ${fila[1]})</div>
                        <div class="gallery-desc" style="font-size: 0.9rem; color: #a1a1aa; margin-top:5px;">${fila[5]}</div>
                        <div style="font-size: 0.8rem; color: #4ade80; margin-top:5px;">${fotos.length} foto(s) del antes y después</div>
                    </div>
                `;
                contenedor.appendChild(tarjeta);
                contador++;
            }
        });
        
        if (contador === 0) {
             contenedor.innerHTML = '<p style="text-align:center; width: 100%;">Próximamente estaremos subiendo nuestros trabajos.</p>';
        }

    } catch (error) {
        contenedor.innerHTML = '<p style="text-align:center; width: 100%;">Error al cargar la galería.</p>';
    }
}