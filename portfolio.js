const root = document.documentElement;
const toggle = document.querySelector('#theme-toggle');
let dark = false;
try {
  dark = localStorage.getItem('portfolio-theme') === 'dark';
} catch {}
function applyTheme() {
  root.dataset.theme = dark ? 'dark' : 'light';
  toggle.setAttribute('aria-pressed', String(dark));
  toggle.textContent = dark ? '☀' : '☾';
  toggle.title = dark ? 'ใช้ธีมสว่าง' : 'ใช้ธีมมืด';
}
applyTheme();
toggle.hidden = false;
toggle.addEventListener('click', () => {
  dark = !dark;
  applyTheme();
  try { localStorage.setItem('portfolio-theme', root.dataset.theme); } catch {}
});
const links = [...document.querySelectorAll('nav a')];
const sections = links.map(link => document.querySelector(link.hash));
let scheduled = false;
function updateNavigation() {
  const offset = document.querySelector('header').offsetHeight + 30;
  let active = null;
  sections.forEach((section, i) => {
    if (section.getBoundingClientRect().top <= offset) active = links[i];
  });
  if (window.innerHeight + window.scrollY >= root.scrollHeight - 3) active = links.at(-1);
  links.forEach(link => {
    if (link === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scheduled = false;
}
function scheduleNavigation() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateNavigation); }
}
window.addEventListener('scroll', scheduleNavigation, { passive: true });
window.addEventListener('resize', scheduleNavigation);
updateNavigation();

const music = document.querySelector('#background-music');
const musicButton = document.querySelector('#music-toggle');
const musicLabel = document.querySelector('#music-label');
const projectVideo = document.querySelector('.project-list video');
let musicEnabled = false;

function syncMusic() {
  const videoActive = projectVideo && !projectVideo.paused && !projectVideo.ended;
  musicButton.setAttribute('aria-pressed', String(musicEnabled));
  musicLabel.textContent = musicEnabled ? 'ปิดเพลง' : 'เปิดเพลง';
  musicButton.title = musicEnabled && videoActive ? 'เพลงพักระหว่างเล่นวิดีโอ' : musicLabel.textContent;
  if (!musicEnabled || videoActive) {
    music.pause();
    return;
  }
  music.play().catch(error => {
    if (error.name === 'AbortError') return;
    musicEnabled = false;
    syncMusic();
    musicButton.title = 'เล่นเพลงไม่ได้ กดเพื่อลองอีกครั้ง';
  });
}
musicButton.hidden = false;
musicButton.addEventListener('click', () => {
  musicEnabled = !musicEnabled;
  syncMusic();
});
for (const event of ['play', 'pause', 'ended']) {
  projectVideo?.addEventListener(event, syncMusic);
}
