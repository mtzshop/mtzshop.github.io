const formProduct = document.querySelector(".form-product");
const loading = document.querySelector(".loading");
const formAlert = document.querySelector(".form-alert");

// Comprimir imagen a ~70KB usando image-compression
async function comprimirA70KB(imagen) {
    console.log('[Compresión] Peso original:' + (imagen.size / 1024).toFixed(2) + 'KB');
    
    const opciones = {
        maxSizeMB: 0.07,
        useWebWorker: true,
        maxWidthOrHeight: 1920,
        fileType: 'image/jpeg'
    };

    try {
        const imagenComprimida = await imageCompression(imagen, opciones);
        console.log('[Compresión] Resultado:', {
            pesoOriginal: `${(imagen.size / 1024).toFixed(2)} KB`,
            pesoComprimido: `${(imagenComprimida.size / 1024).toFixed(2)} KB`,
            reduccion: `${((1 - (imagenComprimida.size / imagen.size))) * 100}`
        });
        return imagenComprimida;
    } catch (error) {
        console.error('[Compresión] Error:', {
            error: error.message,
            archivo: imagen.name,
            tipo: imagen.type
        });
        throw new Error('Error en compresión de imagen. Usando original');
    }
}

async function mostrarContador() {
    try {
        // 1. Obtener datos desde JSONBin.io
        const response = await fetch(`https://api.jsonbin.io/v3/b/681586538561e97a500cb1e6`, {
            headers: { 'X-Master-Key': xMasterKey }
        });
        const data = await response.json();
        console.log(data);
        const views = await data.record.visitas;
        console.log(views)
        
        // 2. Mostrar el valor en el elemento con ID "contador-visitas"
        const contador = document.querySelector('.contador-visitas');
        contador.innerText = views;
        
    } catch (error) {
        console.error('Error al cargar contador:', error);
        const contador = document.getElementById('contador-visitas');
        if (contador) contador.textContent = '0'; // Valor por defecto si hay error
    }
}

// Proceso completo de subida de producto
async function uploadProduct() {
    formAlert.innerHTML = "";
    let errorMessage = "";
    
    try {
        // Obtener valores del formulario
        const elements = {
            title: document.querySelector(".input-title"),
            description: document.querySelector(".input-description"),
            price: document.querySelector(".input-price"),
            popular: document.querySelector(".input-popular"),
            image: document.querySelector(".input-image")
        };

        // Validaciones básicas
        if (!elements.image.files[0]) {
            errorMessage = "❌ Inserte una imagen";
            throw new Error('Imagen no seleccionada');
        }
        if (!elements.price.value) {
            errorMessage = "❌ Inserte un precio";
            throw new Error('Precio vacío');
        }
        if (!elements.title.value || elements.title.value.length < 5) {
            errorMessage = "❌ El título debe tener más de 5 letras";
            throw new Error('Título inválido');
        }

        loading.style.display = "block";
        formProduct.querySelector('button[type="submit"]').disabled = true;

        // Proceso de compresión
        const compressedFile = await comprimirA70KB(elements.image.files[0]);
        
        // Subir imagen a ImgBB
        const formData = new FormData();
        formData.append("image", compressedFile);
        
        const responseImgBb = await fetch(`https://api.imgbb.com/1/upload?key=${keyImgBb}`, {
            method: "POST",
            body: formData
        });
        
        const dataImgBb = await responseImgBb.json();
        if (!dataImgBb.success) {
            console.error('[ImgBB] Error en respuesta:', dataImgBb);
            throw new Error(`API ImgBB: ${dataImgBb.error?.message || 'Error desconocido'}`);
        }

        // Actualizar JSON con nuevo producto
        const products = await productsPromise;
        const nuevoProducto = {
            title: elements.title.value.trim(),
            description: elements.description.value.trim(),
            price: Number(elements.price.value),
            img: dataImgBb.data.url,
            popular: elements.popular.checked
        };
        
        const response = await fetch(`https://api.jsonbin.io/v3/b/${keyBin}`, {
            method: 'PUT',
            headers: {
                'X-Master-Key': xMasterKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ products: [...products, nuevoProducto] })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('[JSONBin] Error:', {
                status: response.status,
                error: errorData
            });
            throw new Error(`API JSONBin: ${errorData.message || 'Error en actualización'}`);
        }

        console.log('[Éxito] Producto agregado:', nuevoProducto);
        formAlert.innerHTML = "<strong>✅ Producto subido correctamente</strong>";
        
        // Resetear formulario
        formProduct.reset();
        window.productsPromise = getProductsPromise(); // Actualizar lista

    } catch (error) {
        console.error(`[Error General] ${error.message}`, {
            stack: error.stack,
            cause: error.cause
        });
        
        formAlert.innerHTML = errorMessage || `
            <strong>⚠️ Error al subir el producto:</strong><br>
            ${error.message.replace('API JSONBin: ', '').replace('API ImgBB: ', '')}
        `;
        
    } finally {
        loading.style.display = "none";
        formProduct.querySelector('button[type="submit"]').disabled = false;
    }
}

// Manejar envío del formulario
formProduct.addEventListener("submit", (e) => {
    e.preventDefault();
    uploadProduct().catch(error => {
        console.error('[Submit] Error no controlado:', error);
    });
});

mostrarContador();