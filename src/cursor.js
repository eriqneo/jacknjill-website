/**
 * Jack & Jill School — Pencil Custom Cursor with Graphite Trail
 * ─────────────────────────────────────────
 * • Tip of pencil is the hotspot
 * • requestAnimationFrame loop for silky-smooth tracking
 * • Canvas-based fading graphite trail "drawn" as user moves the mouse
 * • CSS class toggle for hover effect on <a> and <button>
 * • Graceful fallback: if SVG fails to load, restores the default cursor
 */

const PENCIL_SVG_URL = '/pencil-cursor.svg';

// ── 1. Detect touch / coarse pointer devices ──
const isFinePointer = () => window.matchMedia('(pointer: fine)').matches;

// ── 2. Probe SVG availability ──
const svgExists = () =>
  fetch(PENCIL_SVG_URL, { method: 'HEAD' })
    .then(r => r.ok)
    .catch(() => false);

// ── 3. Core init ──
const initPencilCursor = () => {
  // Cursor DOM element
  const cursor = document.createElement('div');
  cursor.id = 'jj-pencil-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = `<img src="${PENCIL_SVG_URL}" alt="" width="38" height="38" id="jj-pencil-img">`;
  document.body.appendChild(cursor);

  // Magic Trail Canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'jj-cursor-trail';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  document.documentElement.classList.add('jj-custom-cursor-active');

  // ── RAF-driven position & trail ──
  let mouseX = -200, mouseY = -200;
  let curX = -200, curY = -200;
  const LERP = 0.8; // More smooth following
  
  // Trail state
  const points = [];
  const MAX_POINTS = 35;

  const raf = () => {
    // Math for smooth follow
    curX += (mouseX - curX) * LERP;
    curY += (mouseY - curY) * LERP;

    // Move cursor
    cursor.style.transform = `translate(${curX}px, ${curY}px)`;

    // Draw Trail
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Add point if we are inside the window
    if (mouseX > -100 && curX > -100) {
      points.push({ x: curX, y: curY, age: 0 });
    }

    if (points.length > MAX_POINTS) {
      points.shift();
    }

    // Render graphite path
    if (points.length > 2) {
      ctx.beginPath();
      // Start slightly behind the pencil tip
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        // Curve through points
        const xc = (points[i].x + points[i-1].x) / 2;
        const yc = (points[i].y + points[i-1].y) / 2;
        ctx.quadraticCurveTo(points[i-1].x, points[i-1].y, xc, yc);
        
        points[i].age++;
      }
      
      // Connect to the actual tip
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

      // Gradient for fading tail
      const gradient = ctx.createLinearGradient(
        points[0].x, points[0].y, 
        points[points.length - 1].x, points[points.length - 1].y
      );
      // Fading graphite/gold ink look
      gradient.addColorStop(0, 'rgba(249, 166, 2, 0)'); // Fades out
      gradient.addColorStop(1, 'rgba(43, 62, 80, 0.7)'); // Dark navy near pencil tip
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
    
    // Age older points out completely when mouse gets still
    if (points.length > 0) {
        if(points[0].age > MAX_POINTS) {
            points.shift();
        }
    }

    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Hide when mouse leaves the window
  document.addEventListener('mouseleave', () => {
    mouseX = curX = -200;
    mouseY = curY = -200;
  });
  document.addEventListener('mouseenter', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // ── Hover effect on interactive elements ──
  const HOVER_SELECTORS = 'a, button, [role="button"], label[for], input[type="submit"]';

  const addHover = () => cursor.classList.add('jj-pencil-hover');
  const removeHover = () => cursor.classList.remove('jj-pencil-hover');

  document.addEventListener('mouseover', e => {
    if (e.target.closest(HOVER_SELECTORS)) addHover();
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(HOVER_SELECTORS)) removeHover();
  });

  // ── Mousedown "press" feedback ──
  document.addEventListener('mousedown', () => cursor.classList.add('jj-pencil-press'));
  document.addEventListener('mouseup', () => cursor.classList.remove('jj-pencil-press'));

  // ── Fallback ──
  const img = document.getElementById('jj-pencil-img');
  img.addEventListener('error', () => {
    document.documentElement.classList.remove('jj-custom-cursor-active');
    cursor.remove();
    canvas.remove();
    console.warn('[JJ Cursor] pencil-cursor.svg not found — using system cursor.');
  });
};

// ── 4. Bootstrap ──
export const setupPencilCursor = async () => {
  if (!isFinePointer()) return;

  const ok = await svgExists();
  if (!ok) {
    console.warn('[JJ Cursor] SVG probe failed — using system cursor as fallback.');
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPencilCursor);
  } else {
    initPencilCursor();
  }
};
