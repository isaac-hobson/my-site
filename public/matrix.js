const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let columns;
let drops = [];
const fontSize = 16;
const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  columns = Math.floor(width / fontSize);
  drops = [];
  for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100;
  }
}

function draw() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, width, height);
  
  ctx.font = fontSize + 'px monospace';
  
  for (let i = 0; i < drops.length; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    const x = i * fontSize;
    const y = drops[i] * fontSize;
    
    if (drops[i] > 0) {
      ctx.fillStyle = '#003300';
      ctx.fillText(char, x, y - fontSize * 2);
      ctx.fillText(char, x, y - fontSize * 4);
    }
    
    ctx.fillStyle = '#00DD00';
    ctx.fillText(char, x, y);
    
    ctx.fillStyle = '#33FF33';
    ctx.shadowColor = '#33FF33';
    ctx.shadowBlur = 10;
    ctx.fillText(char, x, y + fontSize);
    ctx.shadowBlur = 0;
    
    if (y > height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

resize();
window.addEventListener('resize', resize);
setInterval(draw, 50);
