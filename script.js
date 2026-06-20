

(() => {
  'use strict';

  /* ══════════════════════════════════════════════
     PLANET DATA
  ══════════════════════════════════════════════ */
  const PLANETS = [
    {
      name:'Mercury', type:'Terrestrial Planet',
      radius:0.46, orbit:10, speed:4.74, tilt:0.03,
      selfSpin:0.25, roughness:0.92,
      atmoColor:null,
      panelColor:'#b0a89a', panelGlow:'rgba(170,160,145,0.3)',
      distance:'57.9 million km', moons:0, temp:'167 °C (avg)',
      period:'88 Earth days', diameter:'4,879 km',
      desc:'The smallest planet and closest to the Sun. Its cratered surface bakes at 430 °C by day and freezes at −180 °C at night — the most extreme temperature swings of any planet.',
    },
    {
      name:'Venus', type:'Terrestrial Planet',
      radius:1.12, orbit:16, speed:3.50, tilt:177.4,
      selfSpin:0.15, roughness:0.88,
      atmoColor:[1.0, 0.80, 0.30], atmoStr:1.5,
      panelColor:'#e8c060', panelGlow:'rgba(240,200,80,0.4)',
      distance:'108.2 million km', moons:0, temp:'465 °C',
      period:'225 Earth days', diameter:'12,104 km',
      desc:'The hottest planet due to a runaway greenhouse effect. Its thick CO₂ clouds reflect 70 % of sunlight, making Venus the brightest object in the night sky after the Moon.',
    },
    {
      name:'Earth', type:'Terrestrial Planet',
      radius:1.20, orbit:23, speed:2.98, tilt:23.5,
      selfSpin:0.30, roughness:0.75,
      atmoColor:[0.28, 0.60, 1.0], atmoStr:1.0,
      panelColor:'#4fa3e0', panelGlow:'rgba(79,163,224,0.45)',
      distance:'149.6 million km', moons:1, temp:'15 °C (avg)',
      period:'365.25 days', diameter:'12,742 km',
      desc:'Our home — the only known world that harbors life. Plate tectonics, a magnetic field, liquid water oceans, and a nitrogen-oxygen atmosphere make Earth unique in the solar system.',
      hasClouds:true, hasMoon:true,
    },
    {
      name:'Mars', type:'Terrestrial Planet',
      radius:0.64, orbit:31, speed:2.41, tilt:25.2,
      selfSpin:0.28, roughness:0.90,
      atmoColor:[0.92, 0.42, 0.18], atmoStr:0.45,
      panelColor:'#c1440e', panelGlow:'rgba(200,80,30,0.38)',
      distance:'227.9 million km', moons:2, temp:'−65 °C (avg)',
      period:'687 Earth days', diameter:'6,779 km',
      desc:'The Red Planet hosts Olympus Mons — the tallest volcano in the solar system at 22 km — and Valles Marineris, a canyon system that would stretch across the United States.',
    },
    {
      name:'Jupiter', type:'Gas Giant',
      radius:4.20, orbit:46, speed:1.31, tilt:3.1,
      selfSpin:0.70, roughness:0.95,
      atmoColor:[0.88, 0.60, 0.28], atmoStr:0.85,
      panelColor:'#c88b3a', panelGlow:'rgba(200,140,60,0.35)',
      distance:'778.5 million km', moons:95, temp:'−145 °C (cloud tops)',
      period:'11.86 Earth years', diameter:'139,820 km',
      desc:'The largest planet — 1,300 Earths could fit inside it. Its Great Red Spot is an anticyclonic storm wider than Earth itself that has persisted for at least 350 years.',
    },
    {
      name:'Saturn', type:'Gas Giant',
      radius:3.40, orbit:61, speed:0.97, tilt:26.7,
      selfSpin:0.60, roughness:0.95,
      atmoColor:[0.94, 0.86, 0.52], atmoStr:0.75,
      panelColor:'#e4d191', panelGlow:'rgba(228,209,145,0.4)',
      distance:'1.43 billion km', moons:146, temp:'−178 °C (cloud tops)',
      period:'29.46 Earth years', diameter:'116,460 km',
      desc:'Famous for its spectacular ring system — seven distinct rings made of ice chunks and rocky debris ranging from grains of sand to house-sized boulders.',
      hasRings:true,
    },
    {
      name:'Uranus', type:'Ice Giant',
      radius:2.10, orbit:74, speed:0.68, tilt:97.8,
      selfSpin:0.40, roughness:0.90,
      atmoColor:[0.42, 0.90, 0.86], atmoStr:0.80,
      panelColor:'#7de8e8', panelGlow:'rgba(125,232,232,0.35)',
      distance:'2.87 billion km', moons:28, temp:'−224 °C',
      period:'84 Earth years', diameter:'50,724 km',
      desc:'Uranus rotates on its side — almost certainly the result of a catastrophic ancient collision. Each pole spends 42 years bathed in sunlight, then 42 years in total darkness.',
    },
    {
      name:'Neptune', type:'Ice Giant',
      radius:1.95, orbit:86, speed:0.54, tilt:28.3,
      selfSpin:0.45, roughness:0.88,
      atmoColor:[0.20, 0.36, 0.92], atmoStr:0.75,
      panelColor:'#3f54ba', panelGlow:'rgba(63,84,186,0.4)',
      distance:'4.50 billion km', moons:16, temp:'−218 °C',
      period:'164.8 Earth years', diameter:'49,244 km',
      desc:'The windiest planet in the solar system, with jet streams reaching 2,100 km/h. Neptune generates more internal heat than it receives from the Sun — the source is still not fully understood.',
    },
  ];

  /* ══════════════════════════════════════════════
     GLSL SHADERS — Fresnel atmosphere rim glow
  ══════════════════════════════════════════════ */
  const ATMO_VERT = `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      vNormal  = normalize(normalMatrix * normal);
      vec4 mv  = modelViewMatrix * vec4(position, 1.0);
      vViewDir = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }
  `;
  const ATMO_FRAG = `
    uniform vec3  uColor;
    uniform float uIntensity;
    varying vec3  vNormal;
    varying vec3  vViewDir;
    void main() {
      float rim   = 1.0 - max(dot(vNormal, vViewDir), 0.0);
      float alpha = pow(rim, 3.0) * uIntensity;
      gl_FragColor = vec4(uColor, alpha);
    }
  `;

  /* ══════════════════════════════════════════════
     DOM REFS
  ══════════════════════════════════════════════ */
  const canvas    = document.getElementById('solar-canvas');
  const panel     = document.getElementById('info-panel');
  const closeBtn  = document.getElementById('close-panel');
  const tooltip   = document.getElementById('tooltip');
  const focusBtn  = document.getElementById('focus-btn');
  const resetBtn  = document.getElementById('reset-camera');
  const orbitBtn  = document.getElementById('toggle-orbits');
  const spdBtns   = document.querySelectorAll('.spd-btn');
  const ui = {
    orb:      document.getElementById('planet-orb'),
    name:     document.getElementById('planet-name'),
    type:     document.getElementById('planet-type'),
    distance: document.getElementById('stat-distance'),
    moons:    document.getElementById('stat-moons'),
    temp:     document.getElementById('stat-temp'),
    period:   document.getElementById('stat-period'),
    diameter: document.getElementById('stat-diameter'),
    desc:     document.getElementById('planet-desc'),
  };

  /* ══════════════════════════════════════════════
     STATE
  ══════════════════════════════════════════════ */
  let speedMult   = 1;
  let showOrbits  = true;
  let selectedMesh = null;
  const orbitLines = [];
  const INIT_POS   = new THREE.Vector3(0, 55, 120);
  const INIT_LOOK  = new THREE.Vector3(0, 0, 0);
  const flyState   = {
    active: false,
    pos:  new THREE.Vector3().copy(INIT_POS),
    look: new THREE.Vector3().copy(INIT_LOOK),
  };

  /* ══════════════════════════════════════════════
     THREE.JS SETUP
  ══════════════════════════════════════════════ */
  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  renderer.toneMapping       = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;

  const scene  = new THREE.Scene();
  scene.background = new THREE.Color(0x020509);

  const camera = new THREE.PerspectiveCamera(52, W() / H(), 0.1, 3000);
  camera.position.copy(INIT_POS);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.minDistance   = 10;
  controls.maxDistance   = 420;
  controls.enablePan     = false;
  controls.zoomSpeed     = 0.7;

  window.addEventListener('resize', () => {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
  });

  /* ══════════════════════════════════════════════
     LIGHTING
  ══════════════════════════════════════════════ */
  // Very dim deep-blue ambient — space is dark
  scene.add(new THREE.AmbientLight(0x08101e, 2.2));

  // Sun — main point light
  const sunLight = new THREE.PointLight(0xfff4d8, 4.2, 700);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far  = 700;
  scene.add(sunLight);

  /* ══════════════════════════════════════════════
     TEXTURE HELPER
  ══════════════════════════════════════════════ */
  function makeTex(size, fn) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    fn(c.getContext('2d'), size);
    return new THREE.CanvasTexture(c);
  }

  /* ══════════════════════════════════════════════
     COLORED STARFIELD
  ══════════════════════════════════════════════ */
  (function buildStars() {
    // Spectral palette: O B A F G K M
    const palette = [
      new THREE.Color(0x9bb0ff), // O — blue
      new THREE.Color(0xaabfff), // B — blue-white
      new THREE.Color(0xcad7ff), // A — white-blue
      new THREE.Color(0xf8f7ff), // F — white
      new THREE.Color(0xfff4e8), // G — yellow-white (sun-like)
      new THREE.Color(0xffd2a1), // K — orange
      new THREE.Color(0xffad80), // M — red-orange
    ];
    // Visibility-weighted distribution (blue stars are rarer but bright)
    const dist = [0.02, 0.06, 0.10, 0.16, 0.22, 0.24, 0.20];

    const N   = 15000;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      const r     = 750 + Math.random() * 950;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);

      // Pick spectral type
      const rand = Math.random();
      let cum = 0, ci = 0;
      for (let k = 0; k < dist.length; k++) {
        cum += dist[k];
        if (rand <= cum) { ci = k; break; }
      }
      const c2 = palette[ci];
      // Add slight brightness variance
      const v = 0.7 + Math.random() * 0.3;
      col[i*3]   = c2.r * v;
      col[i*3+1] = c2.g * v;
      col[i*3+2] = c2.b * v;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.9, vertexColors: true, sizeAttenuation: true,
      transparent: true, opacity: 0.92,
    })));
  })();

  /* ══════════════════════════════════════════════
     NEBULA BACKDROP
  ══════════════════════════════════════════════ */
  (function buildNebula() {
    const tex = makeTex(1024, (ctx, s) => {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, s, s);
      const clouds = [
        { x:0.14, y:0.22, r:0.26, col:'rgba(18,35,110,0.20)' },
        { x:0.78, y:0.68, r:0.30, col:'rgba(75,18,88,0.16)'  },
        { x:0.50, y:0.50, r:0.38, col:'rgba(8,45,36,0.12)'   },
        { x:0.88, y:0.18, r:0.20, col:'rgba(110,35,18,0.12)' },
        { x:0.28, y:0.82, r:0.22, col:'rgba(35,10,75,0.14)'  },
        { x:0.62, y:0.08, r:0.24, col:'rgba(8,55,75,0.14)'   },
        { x:0.38, y:0.55, r:0.18, col:'rgba(60,15,80,0.10)'  },
      ];
      clouds.forEach(({ x, y, r, col }) => {
        const gx = x*s, gy = y*s, gr = r*s;
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
      });
      // Milky-way-like dust lane
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = 'rgba(180,160,240,0.3)';
      ctx.beginPath();
      ctx.ellipse(s*0.5, s*0.5, s*0.9, s*0.15, -0.3, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1800, 32, 32),
      new THREE.MeshBasicMaterial({ map:tex, side:THREE.BackSide, transparent:true, opacity:0.55, depthWrite:false })
    ));
  })();

  /* ══════════════════════════════════════════════
     SUN — multi-layer with animated corona
  ══════════════════════════════════════════════ */
  let sunCore, sunHaze;

  (function buildSun() {
    const SUN_R = 7.2;

    // ── Core texture
    const coreTex = makeTex(1024, (ctx, s) => {
      const g = ctx.createRadialGradient(s*0.46, s*0.42, 0, s/2, s/2, s/2);
      g.addColorStop(0.00, '#ffffff');
      g.addColorStop(0.06, '#fff8e0');
      g.addColorStop(0.20, '#ffe060');
      g.addColorStop(0.48, '#f5a018');
      g.addColorStop(0.75, '#bf4c00');
      g.addColorStop(1.00, '#6a1800');
      ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);

      // Solar granulation
      for (let i = 0; i < 1200; i++) {
        const x = Math.random()*s, y = Math.random()*s;
        const r = 2 + Math.random()*24;
        const g2 = ctx.createRadialGradient(x, y, 0, x, y, r);
        const bright = Math.random() > 0.48;
        g2.addColorStop(0, bright ? 'rgba(255,240,120,0.22)' : 'rgba(160,55,0,0.20)');
        g2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g2;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
      }

      // Sunspot pairs
      for (let i = 0; i < 5; i++) {
        const sx = 0.2 + Math.random()*0.6, sy = 0.35 + Math.random()*0.3;
        [0, 0.06].forEach(dx => {
          const sg = ctx.createRadialGradient((sx+dx)*s, sy*s, 0, (sx+dx)*s, sy*s, s*0.03);
          sg.addColorStop(0, 'rgba(40,10,0,0.85)');
          sg.addColorStop(0.6,'rgba(120,30,0,0.40)');
          sg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = sg;
          ctx.beginPath(); ctx.arc((sx+dx)*s, sy*s, s*0.03, 0, Math.PI*2); ctx.fill();
        });
      }
    });

    // ── Turbulence haze layer (counter-rotates)
    const hazeTex = makeTex(512, (ctx, s) => {
      for (let i = 0; i < 500; i++) {
        const x = Math.random()*s, y = Math.random()*s;
        const r = 4 + Math.random()*32;
        const a = 0.04 + Math.random()*0.11;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(255,190,40,${a})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
      }
    });

    sunCore = new THREE.Mesh(
      new THREE.SphereGeometry(SUN_R, 64, 64),
      new THREE.MeshBasicMaterial({ map: coreTex })
    );
    sunHaze = new THREE.Mesh(
      new THREE.SphereGeometry(SUN_R * 1.022, 48, 48),
      new THREE.MeshBasicMaterial({ map: hazeTex, transparent:true, opacity:0.50, blending:THREE.AdditiveBlending, depthWrite:false })
    );
    scene.add(sunCore, sunHaze);

    // ── Glow sprites (3 scales)
    [
      { sz:32,  col:'rgba(255,230,110,0.32)' },
      { sz:50,  col:'rgba(255,145,25,0.14)'  },
      { sz:70,  col:'rgba(200,80,0,0.06)'    },
    ].forEach(({ sz, col }) => {
      const t = makeTex(256, (ctx, s) => {
        const g = ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
        g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0,0,s,s);
      });
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map:t, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false,
      }));
      sp.scale.set(sz, sz, 1);
      scene.add(sp);
    });
  })();

  /* ══════════════════════════════════════════════
     PLANET TEXTURES — one function per body
  ══════════════════════════════════════════════ */

  function texMercury() {
    return makeTex(512, (ctx, s) => {
      const g = ctx.createRadialGradient(s*0.4, s*0.38, 0, s/2, s/2, s/2);
      g.addColorStop(0,'#cac6c0'); g.addColorStop(0.55,'#8c8880'); g.addColorStop(1,'#4a4846');
      ctx.fillStyle=g; ctx.fillRect(0,0,s,s);
      // Craters
      for (let i=0; i<90; i++) {
        const x=Math.random()*s, y=Math.random()*s, r=3+Math.random()*20;
        const cg = ctx.createRadialGradient(x,y,0,x,y,r);
        cg.addColorStop(0,'rgba(35,35,35,0.55)');
        cg.addColorStop(0.65,'rgba(170,165,155,0.18)');
        cg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      }
      // Crater rims (bright ejecta)
      for (let i=0; i<35; i++) {
        const x=Math.random()*s, y=Math.random()*s, r=3+Math.random()*10;
        ctx.strokeStyle=`rgba(215,210,200,${0.25+Math.random()*0.30})`;
        ctx.lineWidth=1.3; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke();
      }
    });
  }

  function texVenus() {
    return makeTex(512, (ctx, s) => {
      const g = ctx.createLinearGradient(0,0,0,s);
      g.addColorStop(0,'#c89838'); g.addColorStop(0.3,'#e0b850');
      g.addColorStop(0.65,'#c08828'); g.addColorStop(1,'#9a5e18');
      ctx.fillStyle=g; ctx.fillRect(0,0,s,s);
      // Thick cloud swirls
      for (let i=0; i<70; i++) {
        const x=Math.random()*s, y=Math.random()*s, r=16+Math.random()*55;
        const a=0.07+Math.random()*0.15;
        const cg=ctx.createRadialGradient(x,y,0,x,y,r);
        cg.addColorStop(0,`rgba(255,240,175,${a})`);
        cg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      }
      // Band structure
      for (let b=0; b<8; b++) {
        const y=(b/8)*s;
        ctx.fillStyle=`rgba(${b%2?210:90},${b%2?165:75},${b%2?15:5},0.09)`;
        ctx.fillRect(0,y,s,s/8);
      }
    });
  }

  function texEarth() {
    return makeTex(1024, (ctx, s) => {
      // Ocean
      const og=ctx.createLinearGradient(0,0,0,s);
      og.addColorStop(0,'#0a2e58'); og.addColorStop(0.5,'#185898'); og.addColorStop(1,'#0a2848');
      ctx.fillStyle=og; ctx.fillRect(0,0,s,s);

      // Helper: draw landmass blob
      const land = (color, points) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(points[0][0]*s, points[0][1]*s);
        for (let i=1; i<points.length; i+=3) {
          const [x1,y1]= points[i]   || points[points.length-1];
          const [x2,y2]= points[i+1] || points[points.length-1];
          const [x3,y3]= points[i+2] || points[points.length-1];
          ctx.bezierCurveTo(x1*s,y1*s,x2*s,y2*s,x3*s,y3*s);
        }
        ctx.closePath(); ctx.fill();
      };

      // North America
      land('#3a6828',[
        [0.18,0.24],[0.24,0.18],[0.32,0.18],[0.38,0.20],
        [0.38,0.22],[0.36,0.32],[0.34,0.36],
        [0.32,0.46],[0.26,0.50],[0.22,0.50],
        [0.14,0.46],[0.10,0.38],[0.12,0.28],[0.16,0.24],
      ]);
      // Greenland
      land('#4a7830',[
        [0.28,0.08],[0.36,0.06],[0.40,0.10],[0.38,0.18],[0.30,0.18],[0.26,0.14],
      ]);
      // South America
      land('#4a7820',[
        [0.24,0.54],[0.32,0.52],[0.36,0.58],[0.35,0.70],
        [0.32,0.80],[0.27,0.82],[0.22,0.76],
        [0.20,0.64],[0.22,0.56],
      ]);
      // Europe
      land('#4e7030',[
        [0.46,0.20],[0.52,0.16],[0.58,0.18],[0.58,0.26],
        [0.55,0.34],[0.50,0.36],[0.46,0.32],[0.44,0.26],
      ]);
      // Africa
      land('#5a7822',[
        [0.48,0.34],[0.56,0.32],[0.62,0.36],[0.62,0.50],
        [0.60,0.64],[0.55,0.74],[0.50,0.72],
        [0.44,0.64],[0.44,0.46],[0.46,0.36],
      ]);
      // Asia
      land('#4a7028',[
        [0.58,0.16],[0.72,0.12],[0.90,0.18],[0.94,0.28],
        [0.92,0.40],[0.82,0.46],[0.72,0.44],
        [0.64,0.40],[0.60,0.32],[0.58,0.20],
      ]);
      // Indian subcontinent
      land('#528030',[
        [0.66,0.44],[0.72,0.42],[0.76,0.50],[0.72,0.60],[0.66,0.58],[0.64,0.50],
      ]);
      // Australia
      land('#7a8022',[
        [0.76,0.60],[0.86,0.58],[0.92,0.64],[0.90,0.74],
        [0.82,0.78],[0.74,0.74],[0.72,0.66],
      ]);
      // Antarctica hint
      land('#c0d0e0',[
        [0.0,0.94],[0.25,0.92],[0.5,0.90],[0.75,0.92],[1.0,0.94],
        [1.0,1.0],[0.0,1.0],
      ]);

      // Ice caps N/S
      const ic1=ctx.createLinearGradient(0,0,0,s*0.12);
      ic1.addColorStop(0,'rgba(215,232,255,0.95)'); ic1.addColorStop(1,'rgba(200,222,255,0)');
      ctx.fillStyle=ic1; ctx.fillRect(0,0,s,s*0.12);
      const ic2=ctx.createLinearGradient(0,s*0.86,0,s);
      ic2.addColorStop(0,'rgba(200,222,255,0)'); ic2.addColorStop(1,'rgba(215,232,255,0.80)');
      ctx.fillStyle=ic2; ctx.fillRect(0,s*0.86,s,s*0.14);

      // Ocean shimmer
      for (let i=0; i<500; i++) {
        ctx.fillStyle=`rgba(80,170,230,${0.02+Math.random()*0.05})`;
        ctx.beginPath();
        ctx.arc(Math.random()*s, Math.random()*s, 1+Math.random()*6, 0, Math.PI*2);
        ctx.fill();
      }
    });
  }

  function texClouds() {
    return makeTex(1024, (ctx, s) => {
      ctx.clearRect(0,0,s,s);
      for (let i=0; i<320; i++) {
        const x=Math.random()*s, y=Math.random()*s, r=6+Math.random()*65;
        const a=0.03+Math.random()*0.20;
        const g=ctx.createRadialGradient(x,y,0,x,y,r);
        g.addColorStop(0,`rgba(255,255,255,${a})`);
        g.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      }
    });
  }

  function texMars() {
    return makeTex(512, (ctx, s) => {
      const g=ctx.createLinearGradient(0,0,0,s);
      g.addColorStop(0,'#c03c0e'); g.addColorStop(0.5,'#e04c18'); g.addColorStop(1,'#a02e0a');
      ctx.fillStyle=g; ctx.fillRect(0,0,s,s);

      // Tharsis volcanic plateau
      ctx.fillStyle='rgba(90,18,5,0.30)';
      ctx.beginPath(); ctx.ellipse(s*0.32,s*0.44,s*0.20,s*0.15,0.25,0,Math.PI*2); ctx.fill();

      // Olympus Mons hint
      const om=ctx.createRadialGradient(s*0.26,s*0.40,0,s*0.26,s*0.40,s*0.07);
      om.addColorStop(0,'rgba(60,12,0,0.45)'); om.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=om; ctx.beginPath(); ctx.arc(s*0.26,s*0.40,s*0.07,0,Math.PI*2); ctx.fill();

      // Valles Marineris canyon system
      ctx.strokeStyle='rgba(70,12,2,0.55)'; ctx.lineWidth=5;
      ctx.beginPath(); ctx.moveTo(s*0.28,s*0.52); ctx.lineTo(s*0.72,s*0.54); ctx.stroke();
      ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(s*0.28,s*0.50); ctx.lineTo(s*0.65,s*0.51); ctx.stroke();

      // Polar caps
      const pc1=ctx.createLinearGradient(0,0,0,s*0.12);
      pc1.addColorStop(0,'rgba(240,242,255,0.92)'); pc1.addColorStop(1,'rgba(255,190,170,0)');
      ctx.fillStyle=pc1; ctx.fillRect(0,0,s,s*0.12);
      const pc2=ctx.createLinearGradient(0,s*0.88,0,s);
      pc2.addColorStop(0,'rgba(255,190,170,0)'); pc2.addColorStop(1,'rgba(240,242,255,0.85)');
      ctx.fillStyle=pc2; ctx.fillRect(0,s*0.88,s,s*0.12);

      // Rocky surface texture
      for (let i=0; i<350; i++) {
        const x=Math.random()*s, y=Math.random()*s, r=1+Math.random()*9;
        ctx.fillStyle=`rgba(${Math.random()>0.5?70:210},${Math.random()>0.5?18:70},0,0.12)`;
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      }
    });
  }

  function texJupiter() {
    return makeTex(1024, (ctx, s) => {
      ctx.fillStyle='#c4a468'; ctx.fillRect(0,0,s,s);

      // Horizontal band system
      const bands=[
        {y:0.04,h:0.06,c:'rgba(155,95,52,0.72)'},
        {y:0.10,h:0.04,c:'rgba(218,192,142,0.60)'},
        {y:0.14,h:0.09,c:'rgba(135,75,35,0.68)'},
        {y:0.23,h:0.04,c:'rgba(210,178,115,0.55)'},
        {y:0.27,h:0.11,c:'rgba(175,115,55,0.62)'},
        {y:0.38,h:0.05,c:'rgba(228,200,148,0.55)'},
        {y:0.43,h:0.09,c:'rgba(148,88,42,0.65)'},
        {y:0.52,h:0.06,c:'rgba(198,168,108,0.52)'},
        {y:0.58,h:0.10,c:'rgba(118,68,32,0.58)'},
        {y:0.68,h:0.06,c:'rgba(218,188,128,0.52)'},
        {y:0.74,h:0.09,c:'rgba(158,98,48,0.62)'},
        {y:0.83,h:0.06,c:'rgba(198,165,100,0.55)'},
        {y:0.89,h:0.11,c:'rgba(138,82,38,0.62)'},
      ];
      bands.forEach(({y,h,c})=>{
        ctx.fillStyle=c; ctx.fillRect(0,y*s,s,h*s);
      });

      // Band-edge turbulence waves
      ctx.save(); ctx.globalAlpha=0.25;
      for (let b=0; b<14; b++) {
        const by=(0.04+b*0.068)*s;
        ctx.beginPath(); ctx.moveTo(0,by);
        for (let x=0; x<=s; x+=8) {
          ctx.lineTo(x, by + Math.sin((x/s)*Math.PI*10+b*1.3)*7);
        }
        ctx.strokeStyle='rgba(80,38,8,0.45)'; ctx.lineWidth=1.8; ctx.stroke();
      }
      ctx.restore();

      // Great Red Spot
      const gx=s*0.64, gy=s*0.60;
      const gg=ctx.createRadialGradient(gx,gy,0,gx,gy,s*0.13);
      gg.addColorStop(0,'rgba(210,58,28,0.95)');
      gg.addColorStop(0.45,'rgba(185,48,18,0.75)');
      gg.addColorStop(1,'rgba(140,38,10,0)');
      ctx.fillStyle=gg;
      ctx.beginPath(); ctx.ellipse(gx,gy,s*0.13,s*0.075,0,0,Math.PI*2); ctx.fill();
      // GRS inner bright core
      const gc=ctx.createRadialGradient(gx-s*0.01,gy-s*0.01,0,gx,gy,s*0.065);
      gc.addColorStop(0,'rgba(245,128,58,0.65)'); gc.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=gc;
      ctx.beginPath(); ctx.ellipse(gx,gy,s*0.065,s*0.04,0,0,Math.PI*2); ctx.fill();

      // White oval storms
      [[0.22,0.36],[0.45,0.28],[0.70,0.44],[0.88,0.62]].forEach(([fx,fy])=>{
        const wg=ctx.createRadialGradient(fx*s,fy*s,0,fx*s,fy*s,s*0.04);
        wg.addColorStop(0,'rgba(240,238,225,0.70)'); wg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=wg;
        ctx.beginPath(); ctx.ellipse(fx*s,fy*s,s*0.04,s*0.025,0,0,Math.PI*2); ctx.fill();
      });
    });
  }

  function texSaturn() {
    return makeTex(512, (ctx, s) => {
      ctx.fillStyle='#d0b068'; ctx.fillRect(0,0,s,s);
      const bands=[
        {y:0.06,h:0.05,c:'rgba(155,125,55,0.62)'},
        {y:0.11,h:0.08,c:'rgba(200,172,108,0.52)'},
        {y:0.19,h:0.06,c:'rgba(138,112,48,0.58)'},
        {y:0.25,h:0.10,c:'rgba(210,182,118,0.48)'},
        {y:0.35,h:0.07,c:'rgba(148,120,52,0.55)'},
        {y:0.42,h:0.09,c:'rgba(194,166,100,0.50)'},
        {y:0.51,h:0.08,c:'rgba(132,108,46,0.55)'},
        {y:0.59,h:0.06,c:'rgba(204,178,112,0.48)'},
        {y:0.65,h:0.10,c:'rgba(150,124,54,0.52)'},
        {y:0.75,h:0.08,c:'rgba(188,162,95,0.48)'},
        {y:0.83,h:0.09,c:'rgba(142,116,50,0.52)'},
      ];
      bands.forEach(({y,h,c})=>{ ctx.fillStyle=c; ctx.fillRect(0,y*s,s,h*s); });
      // Polar vignette
      const pv=ctx.createRadialGradient(s/2,0,0,s/2,0,s*0.35);
      pv.addColorStop(0,'rgba(75,55,18,0.32)'); pv.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=pv; ctx.fillRect(0,0,s,s);
    });
  }

  function texUranus() {
    return makeTex(512, (ctx, s) => {
      const g=ctx.createLinearGradient(0,0,0,s);
      g.addColorStop(0,'#52c8c8'); g.addColorStop(0.35,'#78e2da');
      g.addColorStop(0.65,'#4ec4bc'); g.addColorStop(1,'#38a8a8');
      ctx.fillStyle=g; ctx.fillRect(0,0,s,s);
      // Very subtle banding
      for (let b=0; b<7; b++) {
        ctx.fillStyle=`rgba(${b%2?200:20},${b%2?255:200},${b%2?240:210},0.05)`;
        ctx.fillRect(0,(b/7)*s,s,s/7);
      }
      // Slight cloud variation
      for (let i=0; i<100; i++) {
        const x=Math.random()*s, y=Math.random()*s, r=8+Math.random()*38;
        ctx.fillStyle=`rgba(145,238,228,${0.02+Math.random()*0.05})`;
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      }
    });
  }

  function texNeptune() {
    return makeTex(512, (ctx, s) => {
      const g=ctx.createLinearGradient(0,0,0,s);
      g.addColorStop(0,'#182888'); g.addColorStop(0.38,'#283db8');
      g.addColorStop(0.68,'#1828a0'); g.addColorStop(1,'#0c1868');
      ctx.fillStyle=g; ctx.fillRect(0,0,s,s);
      // White cloud streaks
      for (let i=0; i<45; i++) {
        const y=(0.08+Math.random()*0.84)*s;
        const x=Math.random()*s;
        const w=25+Math.random()*110, h=1.5+Math.random()*8;
        ctx.fillStyle=`rgba(175,198,255,${0.06+Math.random()*0.18})`;
        ctx.beginPath(); ctx.ellipse(x,y,w,h,0,0,Math.PI*2); ctx.fill();
      }
      // Great Dark Spot
      const dx=s*0.38, dy=s*0.46;
      const dg=ctx.createRadialGradient(dx,dy,0,dx,dy,s*0.13);
      dg.addColorStop(0,'rgba(8,18,75,0.55)'); dg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=dg; ctx.beginPath(); ctx.ellipse(dx,dy,s*0.13,s*0.085,0.2,0,Math.PI*2); ctx.fill();
      // Small Scooter cloud
      const sg=ctx.createRadialGradient(s*0.55,s*0.40,0,s*0.55,s*0.40,s*0.055);
      sg.addColorStop(0,'rgba(198,218,255,0.42)'); sg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=sg; ctx.beginPath(); ctx.ellipse(s*0.55,s*0.40,s*0.065,s*0.03,0,0,Math.PI*2); ctx.fill();
    });
  }

  function texMoon() {
    return makeTex(256, (ctx, s) => {
      const g=ctx.createRadialGradient(s*0.42,s*0.40,0,s/2,s/2,s/2);
      g.addColorStop(0,'#d5d1cb'); g.addColorStop(0.5,'#a8a4a0'); g.addColorStop(1,'#606060');
      ctx.fillStyle=g; ctx.fillRect(0,0,s,s);
      // Mare (dark patches)
      [[0.38,0.35,0.18],[0.60,0.42,0.12],[0.45,0.62,0.10],[0.28,0.55,0.08]].forEach(([mx,my,mr])=>{
        const mg=ctx.createRadialGradient(mx*s,my*s,0,mx*s,my*s,mr*s);
        mg.addColorStop(0,'rgba(60,58,55,0.55)'); mg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=mg; ctx.beginPath(); ctx.arc(mx*s,my*s,mr*s,0,Math.PI*2); ctx.fill();
      });
      // Craters
      for (let i=0; i<50; i++) {
        const x=Math.random()*s, y=Math.random()*s, r=2+Math.random()*14;
        const cg=ctx.createRadialGradient(x,y,0,x,y,r);
        cg.addColorStop(0,'rgba(45,43,40,0.50)'); cg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      }
    });
  }

  const TEX_FN = {
    Mercury: texMercury, Venus: texVenus, Earth: texEarth,
    Mars: texMars, Jupiter: texJupiter, Saturn: texSaturn,
    Uranus: texUranus, Neptune: texNeptune,
  };

  /* ══════════════════════════════════════════════
     ATMOSPHERE HELPER
  ══════════════════════════════════════════════ */
  function makeAtmosphere(radius, color, intensity) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.10, 48, 48),
      new THREE.ShaderMaterial({
        vertexShader:   ATMO_VERT,
        fragmentShader: ATMO_FRAG,
        uniforms: {
          uColor:     { value: new THREE.Vector3(...color) },
          uIntensity: { value: intensity },
        },
        side: THREE.FrontSide, transparent: true, depthWrite: false,
      })
    );
  }

  /* ══════════════════════════════════════════════
     ORBIT LINE HELPER
  ══════════════════════════════════════════════ */
  function makeOrbitLine(r) {
    const pts=[];
    for (let i=0; i<=128; i++) {
      const a=(i/128)*Math.PI*2;
      pts.push(new THREE.Vector3(Math.cos(a)*r, 0, Math.sin(a)*r));
    }
    const line=new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color:0x1a4568, transparent:true, opacity:0.28 })
    );
    scene.add(line);
    orbitLines.push(line);
    return line;
  }

  /* ══════════════════════════════════════════════
     SATURN RING SYSTEM — 4 bands + Cassini Division
  ══════════════════════════════════════════════ */
  function makeSaturnRings(parent, r) {
    const ringBands = [
      { inner:r*1.22, outer:r*1.55, alpha:0.52, hue:'#b8a058' },  // C ring (crepe)
      { inner:r*1.57, outer:r*2.00, alpha:0.80, hue:'#d8c070' },  // B ring (brightest)
      { inner:r*2.02, outer:r*2.04, alpha:0.05, hue:'#101010' },  // Cassini Division (dark gap)
      { inner:r*2.06, outer:r*2.40, alpha:0.62, hue:'#c8b860' },  // A ring
    ];

    ringBands.forEach(({ inner, outer, alpha, hue }) => {
      const geo = new THREE.RingGeometry(inner, outer, 128);
      // Re-map UVs radially so the texture gradient goes inner → outer
      const posAttr = geo.attributes.position;
      const uvAttr  = geo.attributes.uv;
      for (let i=0; i<posAttr.count; i++) {
        const x=posAttr.getX(i), z=posAttr.getZ(i);
        const d=Math.sqrt(x*x+z*z);
        uvAttr.setXY(i, (d-inner)/(outer-inner), 0);
      }

      const tex = makeTex(512, (ctx, s) => {
        for (let x=0; x<s; x++) {
          const t = x/s;
          // Particle density variation (ringlets)
          const density = alpha * (
            0.55 + 0.30 * Math.sin(t*Math.PI*18) +
            0.12 * Math.sin(t*Math.PI*55) +
            0.05 * (Math.random()-0.5)
          );
          const c = new THREE.Color(hue);
          ctx.fillStyle=`rgba(${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)},${Math.max(0,density)})`;
          ctx.fillRect(x,0,1,s);
        }
      });

      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
        map:tex, side:THREE.DoubleSide, transparent:true, opacity:1, depthWrite:false,
      }));
      mesh.rotation.x = Math.PI/2;
      parent.add(mesh);
    });
  }

  /* ══════════════════════════════════════════════
     BUILD ALL PLANETS
  ══════════════════════════════════════════════ */
  const planetObjects = []; // animation entries
  const clickTargets  = [];
  let   earthMeshRef  = null;

  PLANETS.forEach(data => {
    const pivot = new THREE.Object3D();
    scene.add(pivot);

    // Planet sphere
    const geo = new THREE.SphereGeometry(data.radius, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
      map:       TEX_FN[data.name](),
      roughness: data.roughness,
      metalness: 0.04,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow    = true;
    mesh.receiveShadow = true;
    mesh.position.x    = data.orbit;
    mesh.rotation.z    = THREE.MathUtils.degToRad(data.tilt);
    mesh.userData.planet = data;
    pivot.add(mesh);

    makeOrbitLine(data.orbit);

    // Atmosphere
    if (data.atmoColor) {
      const atmo = makeAtmosphere(data.radius, data.atmoColor, data.atmoStr ?? 0.9);
      mesh.add(atmo);
    }

    // Saturn rings
    if (data.hasRings) makeSaturnRings(mesh, data.radius);

    // Earth cloud layer
    let cloudMesh = null;
    if (data.hasClouds) {
      cloudMesh = new THREE.Mesh(
        new THREE.SphereGeometry(data.radius * 1.030, 48, 48),
        new THREE.MeshStandardMaterial({
          map: texClouds(), transparent:true, opacity:0.68, depthWrite:false, roughness:0.9,
        })
      );
      mesh.add(cloudMesh);
    }

    // Earth's Moon
    if (data.hasMoon) {
      earthMeshRef = mesh;
      const moonPivot = new THREE.Object3D();
      mesh.add(moonPivot);
      const moonMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 32, 32),
        new THREE.MeshStandardMaterial({ map:texMoon(), roughness:0.92 })
      );
      moonMesh.position.x = data.radius * 3.4;
      moonMesh.castShadow = true;
      moonPivot.add(moonMesh);
      // Moon entry (isMoon = true, no orbit around sun)
      planetObjects.push({ isMoon:true, pivot:moonPivot, moonSpeed:7.5 });
    }

    clickTargets.push(mesh);
    planetObjects.push({ mesh, data, pivot, angle: Math.random()*Math.PI*2, cloudMesh });
  });

  /* ══════════════════════════════════════════════
     RAYCASTER + INTERACTION
  ══════════════════════════════════════════════ */
  const raycaster = new THREE.Raycaster();
  const mouse     = new THREE.Vector2(-9999, -9999); // off-screen default
  let   hoveredData = null;
  const BASE_S = new THREE.Vector3(1,1,1);
  const HOV_S  = new THREE.Vector3(1.055,1.055,1.055);
  let   hovMesh = null;

  function setMouse(e) {
    const t = e.touches ? e.touches[0] : e;
    mouse.x =  (t.clientX / W()) * 2 - 1;
    mouse.y = -(t.clientY / H()) * 2 + 1;
  }

  /* ── Info panel ── */
  function openPanel(data, mesh) {
    ui.orb.style.background = `radial-gradient(circle at 33% 33%, ${shiftColor(data.panelColor,55)}, ${data.panelColor} 55%, ${shiftColor(data.panelColor,-55)})`;
    ui.orb.style.boxShadow  = `0 0 32px ${data.panelGlow}, 0 0 8px ${data.panelColor}`;
    ui.name.textContent     = data.name;
    ui.type.textContent     = data.type;
    ui.distance.textContent = data.distance;
    ui.moons.textContent    = data.moons;
    ui.temp.textContent     = data.temp;
    ui.period.textContent   = data.period;
    ui.diameter.textContent = data.diameter;
    ui.desc.textContent     = data.desc;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden','false');
    selectedMesh = mesh;
    triggerFlyTo(mesh);
  }

  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden','true');
    selectedMesh = null;
  }

  function triggerFlyTo(mesh) {
    const wp = new THREE.Vector3();
    mesh.getWorldPosition(wp);
    const r   = mesh.userData.planet.radius;
    const dir = wp.clone().normalize();
    const up  = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(dir, up).normalize();
    flyState.pos.copy(wp)
      .addScaledVector(side,  r * 5 + 20)
      .addScaledVector(up,    r * 2 + 8);
    flyState.look.copy(wp);
    flyState.active = true;
  }

  function shiftColor(hex, amt) {
    const c = new THREE.Color(hex);
    return `#${new THREE.Color(
      Math.min(1, Math.max(0, c.r + amt/255)),
      Math.min(1, Math.max(0, c.g + amt/255)),
      Math.min(1, Math.max(0, c.b + amt/255))
    ).getHexString()}`;
  }

  /* ── Event listeners ── */
  closeBtn.addEventListener('click', closePanel);

  focusBtn.addEventListener('click', () => {
    if (selectedMesh) triggerFlyTo(selectedMesh);
  });

  resetBtn.addEventListener('click', () => {
    flyState.pos.copy(INIT_POS);
    flyState.look.copy(INIT_LOOK);
    flyState.active = true;
    closePanel();
  });

  orbitBtn.addEventListener('click', () => {
    showOrbits = !showOrbits;
    orbitLines.forEach(l => l.visible = showOrbits);
    orbitBtn.classList.toggle('active', showOrbits);
  });

  canvas.addEventListener('click', e => {
    setMouse(e);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(clickTargets);
    if (hits.length) openPanel(hits[0].object.userData.planet, hits[0].object);
  });

  canvas.addEventListener('mousemove', e => {
    setMouse(e);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(clickTargets);
    if (hits.length) {
      const d = hits[0].object.userData.planet;
      if (hoveredData !== d) { hoveredData = d; tooltip.textContent = d.name; }
      tooltip.style.left = (e.clientX + 16) + 'px';
      tooltip.style.top  = (e.clientY - 8)  + 'px';
      tooltip.classList.add('show');
      canvas.style.cursor = 'pointer';
    } else {
      hoveredData = null;
      tooltip.classList.remove('show');
      canvas.style.cursor = 'grab';
    }
  });

  canvas.addEventListener('mouseleave', () => tooltip.classList.remove('show'));

  spdBtns.forEach(btn => btn.addEventListener('click', () => {
    spdBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    speedMult = parseFloat(btn.dataset.speed);
  }));

  /* ══════════════════════════════════════════════
     ANIMATION LOOP
  ══════════════════════════════════════════════ */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t  = clock.elapsedTime;

    // ── Sun animation
    sunCore.rotation.y += dt * 0.09;
    sunHaze.rotation.y -= dt * 0.065;
    const pulse = 1 + 0.055 * Math.sin(t * 0.85);
    sunLight.intensity = 4.2 * pulse;

    // ── Planet orbits & self-rotation
    planetObjects.forEach(entry => {
      if (entry.isMoon) {
        entry.pivot.rotation.y += dt * entry.moonSpeed * speedMult * 0.012;
        return;
      }
      entry.angle += dt * speedMult * entry.data.speed * 0.012;
      entry.pivot.rotation.y = entry.angle;
      entry.mesh.rotation.y  += dt * entry.data.selfSpin;
      if (entry.cloudMesh) entry.cloudMesh.rotation.y += dt * 0.06;
    });

    // ── Camera fly-to (smooth lerp)
    if (flyState.active) {
      camera.position.lerp(flyState.pos,  0.038);
      controls.target.lerp(flyState.look, 0.038);
      if (camera.position.distanceTo(flyState.pos) < 0.9) flyState.active = false;
    }

    // ── Hover scale pulse
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(clickTargets);
    if (hits.length) {
      const m = hits[0].object;
      if (hovMesh !== m) { if (hovMesh) hovMesh.scale.copy(BASE_S); hovMesh = m; }
      m.scale.lerp(HOV_S, 0.10);
    } else if (hovMesh) {
      hovMesh.scale.lerp(BASE_S, 0.12);
    }

    controls.update();
    renderer.render(scene, camera);
  }

  animate();

})();
