// Cache para almacenar componentes ya cargados
const componentCache = new Map();

const getComp = async (comp) => {
  // Verificar si ya está en caché
  if (componentCache.has(comp)) {
    return componentCache.get(comp);
  }

  try {
    const response = await fetch(`./src/comps/${comp}.html`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.text();
    componentCache.set(comp, data);
    return data;
  } catch (error) {
    console.error(`Error loading component ${comp}:`, error);
    return '';
  }
};

const showComp = async (comp, containerClass) => {
  try {
    const component = await getComp(comp);
    const container = document.querySelector(`.${containerClass}`);
    if (container) {
      container.innerHTML = component;
    }
  } catch (error) {
    console.error(`Error showing component ${comp}:`, error);
  }
};

const highlightActiveLink = () => {
  try {
    const navLinks = document.querySelectorAll('.nav__a');
    const currentPage = window.location.pathname.split('/').pop();
    
    navLinks.forEach(link => {
      const linkPath = link.getAttribute('href').split('/').pop();
      link.classList.toggle('nav__a--active', linkPath === currentPage);
    });
  } catch (error) {
    console.error('Error highlighting active link:', error);
  }
};

// Precargar componentes inmediatamente
const preloadComponents = () => {
  const headerPromise = getComp('header');
  const footerPromise = getComp('footer');
  return Promise.all([headerPromise, footerPromise]);
};

// Cargar todo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Esperar a que terminen las precargas
    await preloadComponents();
    
    // Cargar y mostrar componentes
    await showComp('header', 'header');
    await showComp('footer', 'footer');
    
    // Ejecutar lógica del header después de cargar
    highlightActiveLink();
    
  } catch (error) {
    console.error('Initialization error:', error);
  }
});