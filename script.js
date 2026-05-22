// === CURSOR ===
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});
function animRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animRing);
}
animRing();

// === BACKGROUND CANVAS ===
(function() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], time = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const GRID_COLS = 22;
  const GRID_ROWS = 14;
  let gridPts = [];

  function buildGrid() {
    gridPts = [];
    for (let r = 0; r <= GRID_ROWS; r++) {
      for (let c = 0; c <= GRID_COLS; c++) {
        gridPts.push({
          x: (c / GRID_COLS) * W,
          y: (r / GRID_ROWS) * H,
          ox: c / GRID_COLS,
          oy: r / GRID_ROWS,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
  }
  buildGrid();
  window.addEventListener('resize', buildGrid);

  // Floating nodes
  for (let i = 0; i < 60; i++) {
    nodes.push({
      x: Math.random() * 1, y: Math.random() * 1,
      vx: (Math.random() - 0.5) * 0.00012,
      vy: (Math.random() - 0.5) * 0.00012,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1
    });
  }

  let mouseX = 0.5, mouseY = 0.5;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    time += 0.008;

    // Grid lines (distorted mesh)
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.028)';
    ctx.lineWidth = 0.5;

    function getPt(r, c) {
      const pt = gridPts[r * (GRID_COLS + 1) + c];
      const distort = 0.012;
      const mx_influence = (mouseX - pt.ox) * 0.015;
      const my_influence = (mouseY - pt.oy) * 0.015;
      const wave = Math.sin(time + pt.phase) * distort;
      return {
        x: pt.x + mx_influence * W + wave * W,
        y: pt.y + my_influence * H + wave * H
      };
    }

    // Horizontal lines
    for (let r = 0; r <= GRID_ROWS; r += 2) {
      ctx.beginPath();
      for (let c = 0; c <= GRID_COLS; c++) {
        const p = getPt(r, c);
        if (c === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    // Vertical lines
    for (let c = 0; c <= GRID_COLS; c += 2) {
      ctx.beginPath();
      for (let r = 0; r <= GRID_ROWS; r++) {
        const p = getPt(r, c);
        if (r === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Connection lines between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].x += nodes[i].vx;
      nodes[i].y += nodes[i].vy;
      if (nodes[i].x < 0 || nodes[i].x > 1) nodes[i].vx *= -1;
      if (nodes[i].y < 0 || nodes[i].y > 1) nodes[i].vy *= -1;

      for (let j = i + 1; j < nodes.length; j++) {
        const dx = (nodes[i].x - nodes[j].x) * W;
        const dy = (nodes[i].y - nodes[j].y) * H;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const MAX = 130;
        if (dist < MAX) {
          const alpha = (1 - dist / MAX) * 0.07;
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x * W, nodes[i].y * H);
          ctx.lineTo(nodes[j].x * W, nodes[j].y * H);
          ctx.stroke();
        }
      }

      // Node dot
      ctx.fillStyle = `rgba(255,255,255,${nodes[i].alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(nodes[i].x * W, nodes[i].y * H, nodes[i].r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Scanning light streak
    const sweepX = ((time * 0.04) % 1.4 - 0.2) * W;
    const sweepGrad = ctx.createLinearGradient(sweepX - 80, 0, sweepX + 80, 0);
    sweepGrad.addColorStop(0, 'rgba(255,255,255,0)');
    sweepGrad.addColorStop(0.5, 'rgba(255,255,255,0.018)');
    sweepGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sweepGrad;
    ctx.fillRect(sweepX - 80, 0, 160, H);

    requestAnimationFrame(drawFrame);
  }
  drawFrame();
})();

// === CARD CANVASES ===
const cardThemes = [
  { bg: '#0a0a0f', color1: 'rgba(120,120,180,0.15)', color2: 'rgba(200,200,255,0.08)' },
  { bg: '#0a0f0a', color1: 'rgba(80,160,100,0.12)', color2: 'rgba(180,220,190,0.07)' },
  { bg: '#0f0a0a', color1: 'rgba(180,80,60,0.12)', color2: 'rgba(240,180,160,0.07)' },
  { bg: '#0a0a0a', color1: 'rgba(160,140,60,0.12)', color2: 'rgba(220,200,140,0.07)' },
];
for (let i = 0; i < 4; i++) {
  const cv = document.getElementById(`card-canvas-${i}`);
  if (!cv) continue;
  const ctx2 = cv.getContext('2d');
  const theme = cardThemes[i];
  let t2 = Math.random() * 100;
  const pts = [];
  for (let k = 0; k < 30; k++) {
    pts.push({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006
    });
  }
  function animCard(cv2, ctx3, th, pts2, t2Ref) {
    function frame() {
      const W2 = cv2.offsetWidth || 400;
      const H2 = cv2.offsetHeight || 300;
      cv2.width = W2; cv2.height = H2;
      ctx3.fillStyle = th.bg;
      ctx3.fillRect(0, 0, W2, H2);

      // Grid
      ctx3.strokeStyle = th.color1;
      ctx3.lineWidth = 0.5;
      const step = 36;
      for (let x3 = 0; x3 < W2; x3 += step) {
        ctx3.beginPath();
        ctx3.moveTo(x3, 0); ctx3.lineTo(x3, H2);
        ctx3.stroke();
      }
      for (let y3 = 0; y3 < H2; y3 += step) {
        ctx3.beginPath();
        ctx3.moveTo(0, y3); ctx3.lineTo(W2, y3);
        ctx3.stroke();
      }

      // Points & connections
      for (let p of pts2) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
      }
      for (let a = 0; a < pts2.length; a++) {
        for (let b = a+1; b < pts2.length; b++) {
          const dx = (pts2[a].x - pts2[b].x) * W2;
          const dy = (pts2[a].y - pts2[b].y) * H2;
          const d = Math.sqrt(dx*dx+dy*dy);
          if (d < 100) {
            ctx3.strokeStyle = `rgba(255,255,255,${(1-d/100)*0.12})`;
            ctx3.lineWidth = 0.4;
            ctx3.beginPath();
            ctx3.moveTo(pts2[a].x*W2, pts2[a].y*H2);
            ctx3.lineTo(pts2[b].x*W2, pts2[b].y*H2);
            ctx3.stroke();
          }
        }
        ctx3.fillStyle = th.color2;
        ctx3.beginPath();
        ctx3.arc(pts2[a].x*W2, pts2[a].y*H2, 1.5, 0, Math.PI*2);
        ctx3.fill();
      }

      // Sweep
      const sw = ((t2Ref.v * 0.0025) % 1.3 - 0.15) * W2;
      const sg = ctx3.createLinearGradient(sw-50,0,sw+50,0);
      sg.addColorStop(0,'rgba(255,255,255,0)');
      sg.addColorStop(0.5,'rgba(255,255,255,0.04)');
      sg.addColorStop(1,'rgba(255,255,255,0)');
      ctx3.fillStyle = sg;
      ctx3.fillRect(sw-50,0,100,H2);

      t2Ref.v++;
      requestAnimationFrame(frame);
    }
    frame();
  }
  const ref = { v: t2 };
  animCard(cv, ctx2, theme, pts, ref);
}

// === MARQUEE CONTENT ===
const items = ['3D anamorphic', 'motion design', 'cgi production', 'brand content', 'product visualization', 'immersive visuals', 'digital campaigns', 'creative direction'];
const track = document.getElementById('marquee-track');
const html = [...items, ...items, ...items].map(i =>
  `<span class="marquee-item">${i}</span><span class="marquee-dot"></span>`
).join('');
track.innerHTML = html;

// === SCROLL REVEAL ===
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(el => observer.observe(el));

// === TILT EFFECT ON CARDS ===
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)';
    card.style.transition = 'transform 0.6s ease';
  });
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.15s ease';
  });
});

// === CUBE ROTATION ===
const cubeGroup = document.getElementById('cube-group');
let cubeAngle = 0;
function rotateCube() {
  cubeAngle += 0.3;
  if (cubeGroup) {
    cubeGroup.setAttribute('transform', `rotate(${cubeAngle}, 70, 66)`);
  }
  requestAnimationFrame(rotateCube);
}
rotateCube();

// === PARALLAX HERO ===
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    heroTitle.style.transform = `translateY(${scrolled * 0.15}px)`;
    heroTitle.style.opacity = 1 - scrolled * 0.002;
  }
});

// === OUR WORK CATEGORY CANVASES ===
const wcatConfig = [
  {
    // 3D Anamorphic — geometric wireframe cube lattice feel
    bg: '#060608',
    gridColor: 'rgba(100,110,200,0.09)',
    nodeColor: 'rgba(140,150,255,0.55)',
    lineColor: [100,110,255],
    draw: function(ctx, W, H, t, pts) {
      // Draw a perspective grid (vanishing point)
      const cx = W * 0.5, cy = H * 0.42;
      ctx.strokeStyle = 'rgba(90,100,180,0.07)';
      ctx.lineWidth = 0.6;
      const cols = 10, rows = 8;
      for (let i = 0; i <= cols; i++) {
        const x = (i / cols) * W;
        ctx.beginPath();
        ctx.moveTo(cx + (x - cx) * 0.1, cy + (0 - cy) * 0.1);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let j = 1; j <= rows; j++) {
        const prog = j / rows;
        const y = cy + (H - cy) * prog;
        const xl = cx - (cx) * prog;
        const xr = cx + (W - cx) * prog;
        ctx.beginPath();
        ctx.moveTo(xl, y); ctx.lineTo(xr, y);
        ctx.stroke();
      }
      // Floating hexagonal rings
      for (let r = 0; r < 3; r++) {
        const rx = W * (0.25 + r * 0.25);
        const ry = H * 0.3 + Math.sin(t * 0.6 + r * 2.1) * 18;
        const rad = 28 + r * 14;
        const sides = 6;
        ctx.strokeStyle = `rgba(120,130,230,${0.12 - r * 0.03})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        for (let s = 0; s <= sides; s++) {
          const ang = (s / sides) * Math.PI * 2 - Math.PI / 6 + t * 0.2 * (r % 2 ? 1 : -1);
          const px = rx + Math.cos(ang) * rad;
          const py = ry + Math.sin(ang) * rad;
          s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }
  },
  {
    // Brand Work — clean product geometry, diagonal bold lines
    bg: '#060806',
    gridColor: 'rgba(80,160,90,0.08)',
    nodeColor: 'rgba(100,220,130,0.5)',
    lineColor: [80,200,110],
    draw: function(ctx, W, H, t, pts) {
      // Diagonal slash pattern
      ctx.strokeStyle = 'rgba(70,140,80,0.055)';
      ctx.lineWidth = 0.5;
      const gap = 48;
      for (let x = -H; x < W + H; x += gap) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x + H, H);
        ctx.stroke();
      }
      // Concentric rectangles (product feel)
      for (let i = 1; i <= 4; i++) {
        const margin = i * 28 + Math.sin(t * 0.4 + i) * 4;
        const alpha = 0.08 - i * 0.015;
        ctx.strokeStyle = `rgba(80,190,100,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.strokeRect(margin, margin, W - margin * 2, H - margin * 2);
      }
      // Cross-hair center
      ctx.strokeStyle = 'rgba(80,200,100,0.07)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(W*0.5, 0); ctx.lineTo(W*0.5, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, H*0.5); ctx.lineTo(W, H*0.5);
      ctx.stroke();
    }
  },
  {
    // Artist Visuals — radial burst, concert energy
    bg: '#080608',
    gridColor: 'rgba(180,80,160,0.07)',
    nodeColor: 'rgba(220,120,200,0.5)',
    lineColor: [200,80,180],
    draw: function(ctx, W, H, t, pts) {
      // Radial lines from center
      const cx = W * 0.5, cy = H * 0.45;
      const rays = 24;
      for (let i = 0; i < rays; i++) {
        const ang = (i / rays) * Math.PI * 2 + t * 0.08;
        const len = 180 + Math.sin(t * 1.2 + i * 0.4) * 40;
        const alpha = 0.04 + Math.sin(t * 0.8 + i) * 0.025;
        ctx.strokeStyle = `rgba(180,60,160,${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len);
        ctx.stroke();
      }
      // Concentric circles
      for (let r = 1; r <= 5; r++) {
        const rad = r * 38 + Math.sin(t * 0.5 + r) * 5;
        ctx.strokeStyle = `rgba(190,60,170,${0.06 - r * 0.008})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Rotating triangle
      ctx.strokeStyle = 'rgba(200,80,180,0.1)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      for (let s = 0; s <= 3; s++) {
        const ang = (s / 3) * Math.PI * 2 + t * 0.15;
        const r = 65;
        const px = cx + Math.cos(ang) * r;
        const py = cy + Math.sin(ang) * r;
        s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }
];

wcatConfig.forEach((config, i) => {
  const cv = document.getElementById(`wcat-canvas-${i}`);
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const pts = [];
  for (let k = 0; k < 25; k++) {
    pts.push({
      x: Math.random(), y: Math.random(),
      vx: (Math.random()-0.5)*0.0005,
      vy: (Math.random()-0.5)*0.0005
    });
  }
  let t = Math.random() * 100;
  let frame_count = 0;
  function renderWcat() {
    const W = cv.offsetWidth || 360;
    const H = cv.offsetHeight || 520;
    cv.width = W; cv.height = H;
    t += 0.012;
    frame_count++;

    ctx.fillStyle = config.bg;
    ctx.fillRect(0, 0, W, H);

    // Grid base
    ctx.strokeStyle = config.gridColor;
    ctx.lineWidth = 0.4;
    const gs = 44;
    for (let x = 0; x < W; x += gs) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gs) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    }

    // Custom themed draw
    config.draw(ctx, W, H, t, pts);

    // Floating nodes + connections
    for (let p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x<0||p.x>1) p.vx*=-1;
      if (p.y<0||p.y>1) p.vy*=-1;
    }
    const [r,g,b] = config.lineColor;
    for (let a = 0; a < pts.length; a++) {
      for (let bb = a+1; bb < pts.length; bb++) {
        const dx = (pts[a].x-pts[bb].x)*W;
        const dy = (pts[a].y-pts[bb].y)*H;
        const d = Math.sqrt(dx*dx+dy*dy);
        if (d < 110) {
          const al = (1-d/110)*0.1;
          ctx.strokeStyle = `rgba(${r},${g},${b},${al})`;
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.moveTo(pts[a].x*W, pts[a].y*H);
          ctx.lineTo(pts[bb].x*W, pts[bb].y*H);
          ctx.stroke();
        }
      }
      ctx.fillStyle = config.nodeColor;
      ctx.beginPath();
      ctx.arc(pts[a].x*W, pts[a].y*H, 1.2, 0, Math.PI*2);
      ctx.fill();
    }

    // Vertical sweep
    const sw = ((t * 0.022) % 1.3 - 0.15) * W;
    const sg = ctx.createLinearGradient(sw-60,0,sw+60,0);
    sg.addColorStop(0,'rgba(255,255,255,0)');
    sg.addColorStop(0.5,'rgba(255,255,255,0.03)');
    sg.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(sw-60,0,120,H);

    requestAnimationFrame(renderWcat);
  }
  renderWcat();
});