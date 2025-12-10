document.addEventListener('DOMContentLoaded', () => {
  const quote = "the truth finds those who seek";
  const quoteElement = document.getElementById('quote');
  let charIndex = 0;
  
  function typeQuote() {
    if (charIndex < quote.length) {
      quoteElement.textContent = quote.substring(0, charIndex + 1);
      charIndex++;
      setTimeout(typeQuote, 80);
    }
  }
  
  setTimeout(typeQuote, 1000);
  
  const projectsBtn = document.getElementById('projects-btn');
  const dropdown = document.getElementById('dropdown');
  
  projectsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
  });
  
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== projectsBtn) {
      dropdown.classList.remove('active');
    }
  });
  
  createGeometricShapes();
});

function createGeometricShapes() {
  const container = document.getElementById('geometric-shapes');
  const shapeCount = 5;
  
  for (let i = 0; i < shapeCount; i++) {
    const shape = document.createElement('div');
    shape.className = 'floating-shape';
    shape.style.cssText = `
      position: absolute;
      width: ${30 + Math.random() * 50}px;
      height: ${30 + Math.random() * 50}px;
      border: 1px solid rgba(51, 255, 51, 0.3);
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float${i} ${15 + Math.random() * 10}s infinite linear;
      transform: rotate(${Math.random() * 360}deg);
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float${i} {
        0% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(${-50 + Math.random() * 100}px, ${-50 + Math.random() * 100}px) rotate(90deg); }
        50% { transform: translate(${-50 + Math.random() * 100}px, ${-50 + Math.random() * 100}px) rotate(180deg); }
        75% { transform: translate(${-50 + Math.random() * 100}px, ${-50 + Math.random() * 100}px) rotate(270deg); }
        100% { transform: translate(0, 0) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    container.appendChild(shape);
  }
}
