// ── AUDIO ENGINE (Web Audio API - no files needed) ──────────────────────────
const AC = new (window.AudioContext || window.webkitAudioContext)();

function resumeAC() { if (AC.state === 'suspended') AC.resume(); }
document.addEventListener('click', resumeAC, { once: true });
document.addEventListener('keydown', resumeAC, { once: true });

function playTone(freq, type, duration, vol=0.3, fadeOut=true) {
  const osc = AC.createOscillator();
  const gain = AC.createGain();
  osc.connect(gain); gain.connect(AC.destination);
  osc.type = type; osc.frequency.setValueAtTime(freq, AC.currentTime);
  gain.gain.setValueAtTime(vol, AC.currentTime);
  if (fadeOut) gain.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + duration);
  osc.start(); osc.stop(AC.currentTime + duration);
}

function playNoise(duration, vol=0.15) {
  const bufSize = AC.sampleRate * duration;
  const buf = AC.createBuffer(1, bufSize, AC.sampleRate);
  const data = buf.getChannelData(0);
  for (let i=0; i<bufSize; i++) data[i] = Math.random()*2-1;
  const src = AC.createBufferSource();
  src.buffer = buf;
  const gain = AC.createGain();
  src.connect(gain); gain.connect(AC.destination);
  gain.gain.setValueAtTime(vol, AC.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, AC.currentTime+duration);
  src.start(); src.stop(AC.currentTime+duration);
}

// ❌ Senha errada — som de erro/glitch
function soundError() {
  resumeAC();
  playTone(120, 'sawtooth', 0.3, 0.25);
  setTimeout(() => playTone(80, 'sawtooth', 0.25, 0.2), 80);
  setTimeout(() => playNoise(0.15, 0.1), 100);
  setTimeout(() => playTone(60, 'square', 0.4, 0.15), 200);
}

// ✅ Senha correta — som de acesso concedido
function soundAccess() {
  resumeAC();
  playTone(440, 'sine', 0.15, 0.2);
  setTimeout(() => playTone(660, 'sine', 0.15, 0.2), 120);
  setTimeout(() => playTone(880, 'sine', 0.3, 0.25), 240);
  setTimeout(() => playTone(1100, 'sine', 0.5, 0.3), 400);
}

// 🔄 Restaurando — beeps sequenciais tipo sistema carregando
let restoreSoundInterval = null;
function soundRestoreStart() {
  resumeAC();
  let beat = 0;
  restoreSoundInterval = setInterval(() => {
    const freqs = [220,330,440,550,660,770,880,990,1100];
    const f = freqs[beat % freqs.length];
    playTone(f, 'sine', 0.08, 0.08, true);
    beat++;
  }, 280);
}
function soundRestoreStop() {
  if (restoreSoundInterval) { clearInterval(restoreSoundInterval); restoreSoundInterval = null; }
}

// 🎉 Sistema restaurado — fanfarra curta
function soundRestored() {
  resumeAC();
  soundRestoreStop();
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.4, 0.3), i*140));
  setTimeout(() => {
    playTone(784, 'sine', 0.2, 0.2);
    playTone(1047, 'sine', 0.4, 0.35);
  }, 700);
}

// ── CANVAS PARTICLES ─────────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [], mouse = { x:0, y:0 };
function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

class Particle {
  constructor() { this.reset(); }
  reset() { this.x=Math.random()*W; this.y=Math.random()*H; this.vx=(Math.random()-.5)*.4; this.vy=(Math.random()-.5)*.4; this.r=Math.random()*1.5+.5; this.alpha=Math.random()*.5+.1; this.color=Math.random()>.5?'#00ff9f':'#00c3ff'; }
  update() {
    const dx=mouse.x-this.x, dy=mouse.y-this.y, d=Math.sqrt(dx*dx+dy*dy);
    if(d<100){this.vx+=(dx/d)*.02;this.vy+=(dy/d)*.02;}
    this.x+=this.vx; this.y+=this.vy;
    if(this.x<0||this.x>W||this.y<0||this.y>H)this.reset();
  }
  draw() { ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=this.color; ctx.globalAlpha=this.alpha; ctx.fill(); }
}
for(let i=0;i<120;i++) particles.push(new Particle());

function drawConnections() {
  for(let i=0;i<particles.length;i++) for(let j=i+1;j<particles.length;j++){
    const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y, d=Math.sqrt(dx*dx+dy*dy);
    if(d<90){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle='#00c3ff';ctx.globalAlpha=(1-d/90)*.12;ctx.lineWidth=.5;ctx.stroke();}
  }
}
function drawBG() {
  const t=Date.now()*.0005;
  const grd=ctx.createRadialGradient(W/2+Math.sin(t)*50,H/2+Math.cos(t)*30,0,W/2,H/2,Math.max(W,H)*.8);
  grd.addColorStop(0,'rgba(0,40,80,.15)'); grd.addColorStop(.5,'rgba(20,0,60,.1)'); grd.addColorStop(1,'rgba(2,8,16,0)');
  ctx.fillStyle=grd; ctx.globalAlpha=1; ctx.fillRect(0,0,W,H);
}
function loop() { ctx.clearRect(0,0,W,H); drawBG(); drawConnections(); particles.forEach(p=>{p.update();p.draw();}); ctx.globalAlpha=1; requestAnimationFrame(loop); }
loop();

// ── TERMINAL BOOT ─────────────────────────────────────────────────────────────
const termLog = document.getElementById('terminal-log');
const BOOT_LINES = [
  {text:'Inicializando sistema...',       cls:'log-line',       delay:400},
  {text:'Verificando integridade...',     cls:'log-line',       delay:900},
  {text:'Carregando módulos...',          cls:'log-line',       delay:1400},
  {text:'[ERRO] Falha crítica detectada', cls:'log-line error', delay:1900},
  {text:'[ERRO] Corrupção em 0x4F2A-0x8C1B', cls:'log-line error', delay:2400},
  {text:'Sistema comprometido. Aguardando chave...', cls:'log-line warn', delay:3000},
];
function typeLine(cls, text, speed=22) {
  return new Promise(res => {
    const cur = termLog.querySelector('.cursor'); if(cur) cur.remove();
    const span = document.createElement('div'); span.className = cls; termLog.appendChild(span);
    const newCur = document.createElement('span'); newCur.className='cursor'; termLog.appendChild(newCur);
    let i=0; const iv=setInterval(()=>{ span.textContent+=text[i++]; if(i>=text.length){clearInterval(iv);res();} },speed);
  });
}
async function runBootSequence() {
  for(let i=0;i<BOOT_LINES.length;i++){
    const prev = i>0 ? BOOT_LINES[i-1].delay : 0;
    await new Promise(r=>setTimeout(r, BOOT_LINES[i].delay - prev));
    await typeLine(BOOT_LINES[i].cls, BOOT_LINES[i].text);
  }
}
runBootSequence();

// ── PASSWORD ──────────────────────────────────────────────────────────────────
const CORRECT_KEY = 'restorecav';
const pwInput   = document.getElementById('password-input');
const restoreBtn= document.getElementById('restore-btn');
const errorMsg  = document.getElementById('error-msg');

restoreBtn.addEventListener('click', tryRestore);
pwInput.addEventListener('keydown', e=>{ if(e.key==='Enter') tryRestore(); });

function tryRestore() {
  resumeAC();
  const val = pwInput.value.trim().toLowerCase();
  if(val === CORRECT_KEY) {
    soundAccess();
    setTimeout(startRestore, 300);
  } else {
    soundError();
    pwInput.classList.remove('shake'); void pwInput.offsetWidth; pwInput.classList.add('shake');
    errorMsg.classList.add('show');
    document.querySelector('.glitch').style.filter='hue-rotate(180deg)';
    setTimeout(()=>{ document.querySelector('.glitch').style.filter=''; pwInput.classList.remove('shake'); pwInput.value=''; },600);
    setTimeout(()=>errorMsg.classList.remove('show'),3000);
  }
}

// ── RESTORE SEQUENCE ──────────────────────────────────────────────────────────
const RESTORE_LINES = [
  'Autenticação confirmada...',
  'Iniciando protocolo de restauração...',
  'Reconstruindo módulo de comunicação...',
  'Recuperando lógica principal...',
  'Descriptografando banco de dados...',
  'Verificando checksums...',
  'Sincronizando registros...',
  'Restauração concluída.',
];

async function startRestore() {
  document.getElementById('corrupted-state').style.animation='glitch-main 0.3s 4';
  await new Promise(r=>setTimeout(r,400));
  document.getElementById('corrupted-state').style.display='none';
  document.getElementById('progress-section').classList.add('visible');
  soundRestoreStart();

  const rtLog = document.getElementById('restore-log-text');
  for(const line of RESTORE_LINES) await typeText(rtLog, line+'\n', 24);

  await animateProgress();
  soundRestored();

  // Swap logo to clean version
  const logoBg = document.getElementById('logo-bg');
  const logoImg = document.getElementById('logo-img');
  logoBg.style.transition = 'opacity 0.5s ease, filter 1.5s ease';
  logoBg.style.opacity = '0';
  setTimeout(() => {
    logoImg.src = 'descorrompido.png';
    logoBg.classList.remove('corrupted');
    logoBg.classList.add('restored');
    logoBg.style.opacity = '0.35';
  }, 600);

  await updateStatus('p-com','ONLINE',33);
  await updateStatus('p-log','OK',66);
  await updateStatus('p-dat','RECOVERED',100);
  await new Promise(r=>setTimeout(r,600));
  showFinalScreen();
}

function typeText(el, text, speed) {
  return new Promise(res => { let i=0; const iv=setInterval(()=>{ el.textContent+=text[i++]; if(i>=text.length){clearInterval(iv);res();} },speed); });
}
function animateProgress() {
  return new Promise(res => {
    let pct=0;
    const fill=document.getElementById('progress-fill'), pctEl=document.getElementById('progress-pct');
    const iv=setInterval(()=>{ pct++; fill.style.width=pct+'%'; pctEl.textContent=pct+'%'; if(pct>=100){clearInterval(iv);res();} },28);
  });
}
function updateStatus(id,value,pct) {
  return new Promise(res => {
    setTimeout(()=>{ const el=document.getElementById(id); el.classList.add('online'); el.querySelector('.status-value').textContent=value; res(); }, pct===33?800:pct===66?1600:2400);
  });
}

// ── NARRATIVE ─────────────────────────────────────────────────────────────────
const NARRATIVE = `Parabéns.\n\nVocês conseguiram restaurar o sistema.\n\nCada etapa resolvida trouxe de volta partes essenciais: lógica, comunicação e dados.\n\nSem vocês, o sistema permaneceria corrompido.\n\nAgora ele está completo.`;

async function showFinalScreen() {
  document.getElementById('progress-section').classList.remove('visible');
  const fs=document.getElementById('final-screen'); fs.classList.add('visible');
  const narrative=document.getElementById('narrative'); narrative.textContent='';
  const cursor=document.createElement('span'); cursor.className='cursor'; narrative.appendChild(cursor);
  for(const char of NARRATIVE){
    const t=document.createTextNode(char); narrative.insertBefore(t,cursor);
    await new Promise(r=>setTimeout(r,char==='\n'?240:20));
  }
}

// ── FINALIZE (handled by patched version below) ──────────────────────────────
function launchCinematic(team) {} // stub - overridden below

// ── EASTER EGG & SECRET SCREENS ──────────────────────────────────────────────

// Override the launchCinematic to also schedule the signal
const _origLaunchCinematic = launchCinematic;
// We'll hook into it below by patching the easter-egg timing

function showSignalAlert() {
  const sig = document.getElementById('signal-alert');
  sig.classList.add('show');
}

// Patch: replace the easter-egg block inside launchCinematic
// We'll add signal logic after cinematic lines appear
function launchCinematicPatched(team) {
  const cin = document.getElementById('cinematic');
  cin.classList.add('visible');
  document.getElementById('welcome-team').textContent = 'WELCOME, ' + team;
  ['c1','c2','c3'].forEach((id,i) => setTimeout(() => document.getElementById(id).classList.add('show'), 300 + i*700));
  setTimeout(() => document.getElementById('welcome-team').classList.add('show'), 2400);
  // Signal appears 4s after welcome
  setTimeout(showSignalAlert, 5800);
}

// Re-bind finalize button with patched version
document.getElementById('finalize-btn').addEventListener('click', () => {
  const team = document.getElementById('team-input').value.trim() || 'EQUIPE';
  launchCinematicPatched(team.toUpperCase());
});

// Signal click → open secret overlay
document.getElementById('signal-alert').addEventListener('click', () => {
  resumeAC();
  const sig = document.getElementById('signal-alert');
  sig.classList.add('glitch-flash');
  playTone(200, 'sine', 0.1, 0.15);
  setTimeout(() => playTone(400, 'sine', 0.15, 0.2), 80);
  setTimeout(() => {
    sig.style.display = 'none';
    openSecretOverlay();
  }, 420);
});

function openSecretOverlay() {
  resumeAC();
  playTone(300, 'sine', 0.08, 0.1);
  setTimeout(() => playTone(500, 'triangle', 0.2, 0.3), 120);
  const overlay = document.getElementById('secret-overlay');
  overlay.classList.add('visible');
  // Type the title lines
  const el = document.getElementById('secret-typing');
  el.textContent = '';
  const lines = ['>> SIGNAL INTERCEPTED', '>> IDENTIFICATION REQUIRED'];
  typeSecretLines(el, lines);
}

async function typeSecretLines(el, lines) {
  for (const line of lines) {
    for (const char of line) {
      el.textContent += char;
      await new Promise(r => setTimeout(r, 38));
    }
    el.textContent += '\n';
    await new Promise(r => setTimeout(r, 280));
  }
}

function selectLevel(year) {
  resumeAC();
  playTone(440, 'sine', 0.12, 0.18);
  setTimeout(() => playTone(660, 'sine', 0.18, 0.25), 100);

  // Block the OTHER button
  const otherYear = year === 8 ? 9 : 8;
  const otherBtn = document.getElementById('btn-' + otherYear);
  otherBtn.disabled = true;
  otherBtn.style.opacity = '0.2';
  otherBtn.style.pointerEvents = 'none';
  otherBtn.style.borderColor = 'rgba(0,195,255,0.15)';
  otherBtn.style.color = 'rgba(0,195,255,0.2)';

  // Ripple effect
  const btn = document.getElementById('btn-' + year);
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const size = Math.max(btn.offsetWidth, btn.offsetHeight);
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (btn.offsetWidth/2 - size/2) + 'px';
  ripple.style.top  = (btn.offsetHeight/2 - size/2) + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);

  // Transition
  const screenId = document.getElementById('screen-id');
  screenId.style.opacity = '0';
  screenId.style.filter = 'blur(4px)';

  setTimeout(() => {
    screenId.classList.remove('active');
    screenId.style.opacity = '';
    screenId.style.filter = '';

    const target = document.getElementById('screen-' + year);
    target.classList.add('active');

    // Type module title
    const titleEl = document.getElementById('title-' + year);
    titleEl.textContent = '';
    typeSecretLines(titleEl, ['>> MÓDULO LIBERADO: ' + year + 'º ANO']);
  }, 400);
}

function backToId() {
  resumeAC();
  playTone(220, 'sine', 0.1, 0.12);

  ['screen-8', 'screen-9'].forEach(id => {
    const el = document.getElementById(id);
    if (el.classList.contains('active')) {
      el.style.opacity = '0';
      el.style.filter = 'blur(4px)';
      setTimeout(() => {
        el.classList.remove('active');
        el.style.opacity = '';
        el.style.filter = '';
      }, 350);
    }
  });

  setTimeout(() => {
    const sid = document.getElementById('screen-id');
    sid.classList.add('active');
    const el = document.getElementById('secret-typing');
    el.textContent = '';
    typeSecretLines(el, ['>> SIGNAL INTERCEPTED', '>> IDENTIFICATION REQUIRED']);
  }, 380);
}