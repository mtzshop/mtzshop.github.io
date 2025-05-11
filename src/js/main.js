import {s, sAll, ValidationError, ConectionError} from "./mylib.js";


const keyImgBb = "42c2035207510686c7c9d6f3301059b3";
const keyBin = "6810d5b88561e97a500a0dec";
const xMasterKey = "$2a$10$QBpnVlqFPhaiynczLJl7fuotcF3IAww5INCQXiVp8H3k7jXZuwDy2";

// Obtener productos desde la API (reintenta cada 3s si falla)
const getProductsPromise = async () => {
    while (true) {
        try {
            const response = await fetch(`https://api.jsonbin.io/v3/b/${keyBin}`, {
                headers: {
                    'X-Master-Key': xMasterKey,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            return data.record.products;
        } catch (error) {
            console.error("Error cargando el json:" + error);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
};
window.productsPromise = getProductsPromise();

// Plantilla HTML para productos
const htmlProduct = (img, t, d, p, isAdmin = false) => {
    return `<article class="product-item">
                <img decoding="async" loading="lazy" alt="${t}" src="${img}">
                <div>
                    <h2>${t}</h2>
                    <p>${d}</p>
                    <span>${p}</span>
                    <button class="buy">Me interesa</button>
                    ${isAdmin ? `<button class="btn-delete mt-2" data-title="${t}" >Eliminar</button>` : ''}
                </div>
            </article>`;
};

// Eliminar producto de la API
const deleteProduct = async title => {
    try {
        let productOriginal = await productsPromise;
        let productUpdated = productOriginal.filter(e => e.title !== title);
        
        const response = await fetch(`https://api.jsonbin.io/v3/b/${keyBin}`, {
            method: 'PUT',
            headers: {
                'X-Master-Key': xMasterKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ products: productUpdated })
        });
        
        if (!response.ok) {
            formAlert.innerText = "Error al eliminar producto";
            throw new ConectionError("Error al eliminar de la BD el producto");
        }
        
        // Eliminar elementos del DOM
        sAll(`[data-title="${title}"]`).forEach(el => {
            el.parentElement.parentElement.remove();
        });
        console.log("eliminado con exito");
    } catch (error) {
        console.error(error);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const productList = s(".product-list");
    const productPopularList = s(".product-popular");
    const isAdmin = document.body.classList.contains("admin");
    

    // Manejar errores en todas las imágenes
    sAll("img").forEach(img => {
        img.addEventListener("error", function() {
            this.src = "./src/img/placeholder-img.jpg";
            this.alt = "Imagen no disponible";
        });
    });

    // Configurar slider inicial (si hay elementos)
    if (typeof tns !== 'undefined' && productPopularList && productPopularList.children.length > 0) {
        var slider = tns({
            container: '.product-popular',
            items: 2,
            slideBy: 1,
            speed: 300,
            controls: false,
            nav: false,
            loop: true,
            mouseDrag: true,
        });
    }
    
    const updateModal = ()=>{
        const productItem = sAll(".product-item");
    
            for(let product of productItem){
                product.querySelector(".buy").addEventListener("click",function(){
                const img = product.querySelector("img").src;
                const title = product.querySelector("h2").textContent;
                const description = product.querySelector("p").textContent;
                const price = product.querySelector("span").textContent;
                
                titleModalProduct.innerText = title;
                imgModal.src = img;
                descriptionModal.innerText = description;
                priceModal.innerText = price;
                
                
                modalProduct.open();
                });
                
    }
};


    const sendOrder = ()=>{
    const title = encodeURIComponent(titleModalProduct.textContent);
    let directionHome = encodeURIComponent(directionInput.value.replace(/\r?\n|\r/g, ' '));
    let service;
    if(homeService){
        service = "A domicilio";
    } else {
        service = "Para recoger";
    }
    
    let msgLink = `%20%2APedido:%2A%20${title}%0A%2AServicio:%2A%20${service}${
      homeService ? `%0A%2ADirecci%C3%B3n:%2A%20${directionHome}` : ""
    }`;
    
    let numbLink = "5359402004";
    
    window.open(`https://wa.me/${numbLink}?text=${msgLink}`);
    };

    // Función principal para renderizar productos
    const showProducts = async () => {
        const products = await productsPromise;
        let productPopular = "";
        let productGeneral = "";
        let itemListElement = [];
        const schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": itemListElement
        };

        // Generar HTML para cada producto
        products.forEach((p,i) => {
            let product = htmlProduct(p.img, p.title, p.description, p.price, isAdmin);
            
            if (p.popular == true) {
                productPopular += product;
            }
            productGeneral += product;
            
            
            //alamcenar schema de productos
            itemListElement.push({
                "@type": "ListItem",
                "position": i + 1,
                "item": {
                "@type": "Product",
                "name": p.title,
                "image": p.img,
                "offers": {
                "@type": "Offer",
                "price": p.price,
                "priceCurrency": "CUP"
                }
                }
            });
            
        });
        

        try {
            // Insertar productos en el DOM
            if (productPopularList) productPopularList.innerHTML = productPopular;
            productList.innerHTML = productGeneral;

            
            // Reconfigurar slider después de actualizar contenido
            if (typeof tns !== 'undefined' && productPopularList) {
                if (slider && slider.destroy) {
                    slider.destroy();
                }
                
                var slider = tns({
                    container: '.product-popular',
                    items: 1,
                    center: true,
                    fixedWidth: 170,
                    slideBy: 1,
                    speed: 300,
                    controls: false,
                    nav: false,
                    gutter: 20,
                    loop: true,
                    mouseDrag: true,
                    responsive: {
                        768: {
                            fixedWidth: 240
                        }
                    }
                });
            }
            
            //inyectar schema en el body
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(schema);
            document.head.appendChild(script);
            
            updateModal();

            // Agregar listeners de eliminación (solo admin)
            if (isAdmin) {
                sAll(".btn-delete").forEach(btn => {
                    btn.addEventListener("click", e => {
                        const title = e.target.dataset.title;
                        deleteProduct(title);
                    });
                });
            }
            
  
  
        } catch (e) {
            console.log("Error al mostrar productos:" + e);
        }
    };

    showProducts();
    
    
    
//Modal Product

class Modal {
  constructor(modal,overlay) {
    this.modal = s(modal);
    this.modalOverlay = s(overlay);
    this.isOpen = false;
    this.init();
  }

  init() {
    this.modalOverlay.addEventListener('click', function(e){
        e.stopPropagation();
    });
    this.modal.addEventListener('click', () =>{
        this.close();
        
    });
    this.modal.querySelector(".close-btn").addEventListener("click",()=>{
            this.close();
        });
  }

  open() {
    this.modal.style.display = 'flex';
    document.body.classList.add('body-no-scroll');
    this.isOpen = true;
  }

  close() {
    this.modal.style.display = 'none';
    document.body.classList.remove('body-no-scroll');
    this.isOpen = false;
  }
}






const modalProduct = new Modal(".modal-product",".modal-product-overlay");



const formModalProduct = s(".form-modal-product");
const radio = sAll('.radio-container input');
const labelDomicilio = sAll(".radio-container label");
const directionInfo = s(".modal-direction");
const directionLabel = s(".modal-direction-label");
const radioDomicilio = s(".radio-domicilio");
const radioRecoger = s(".radio-recoger");
const directionInput = s(".modal-direction-input");
const titleModalProduct = modalProduct.modalOverlay.querySelector(".modal-title");
    const imgModal = modalProduct.modalOverlay.querySelector(".modal-img");
    const priceModal = modalProduct.modalOverlay.querySelector(".modal-price");
    const descriptionModal = modalProduct.modalOverlay.querySelector(".modal-description");


let homeService = true;

radio.forEach(radio => {
    const label = radio.closest("label");
  radio.addEventListener('change', function() {
    labelDomicilio.forEach(l => l.classList.remove("label-checked"));
    if (this.checked) {
      homeService = (radio.value === "domicilio");
      label.classList.add("label-checked");
    }
    if(radioDomicilio.checked){
        directionInput.required = true;
        directionInfo.style.display = "none";
        directionLabel.style.display = "flex";
    }
    if(radioRecoger.checked){
        directionInput.required = false;
        directionInfo.style.display = "block";
        directionLabel.style.display = "none";
    }
    
  });
});

formModalProduct.addEventListener("submit",()=>{
    sendOrder();
})
    


    
    
    
    
    
});





