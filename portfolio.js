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

const musicBox = document.querySelector('#music-box');
const track = document.querySelector('#song-player');
const play = document.querySelector('#song-play');
const stop = document.querySelector('#song-stop');
const quieter = document.querySelector('#volume-down');
const louder = document.querySelector('#volume-up');
const volumeLabel = document.querySelector('#song-volume');
const statusLine = document.querySelector('#song-status');
const video = document.querySelector('.project-list video');
let resumeAfterVideo = false;
let level = 40;

function setLevel(value) {
  level = Math.max(0, Math.min(100, value));
  track.volume = level / 100;
  volumeLabel.value = level + '%';
  quieter.disabled = level === 0;
  louder.disabled = level === 100;
}

async function playSong() {
  if (video && !video.paused && !video.ended) {
    resumeAfterVideo = true;
    statusLine.textContent = 'เพลงจะเล่นเมื่อหยุดวิดีโอโปรเจกต์';
    return;
  }
  try {
    await track.play();
    statusLine.textContent = 'กำลังเล่น';
  } catch (error) {
    if (error.name !== 'AbortError') statusLine.textContent = 'เล่นเพลงไม่ได้ กรุณาลองอีกครั้ง';
  }
}

function stopSong() {
  resumeAfterVideo = false;
  track.pause();
  track.currentTime = 0;
  statusLine.textContent = '';
}

setLevel(level);
play.disabled = stop.disabled = false;
play.addEventListener('click', playSong);
stop.addEventListener('click', stopSong);
quieter.addEventListener('click', () => setLevel(level - 10));
louder.addEventListener('click', () => setLevel(level + 10));
musicBox.addEventListener('toggle', () => { if (!musicBox.open) stopSong(); });
track.addEventListener('ended', () => { statusLine.textContent = 'จบเพลง'; });
video?.addEventListener('play', () => {
  if (track.paused) return;
  resumeAfterVideo = true;
  track.pause();
  statusLine.textContent = 'พักเพลงระหว่างเล่นวิดีโอ';
});
function resumeSong() {
  if (resumeAfterVideo && musicBox.open) {
    resumeAfterVideo = false;
    playSong();
  }
}
video?.addEventListener('pause', resumeSong);
video?.addEventListener('ended', resumeSong);
