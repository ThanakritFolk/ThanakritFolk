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
const play = document.querySelector('#song-play');
const stop = document.querySelector('#song-stop');
const quieter = document.querySelector('#volume-down');
const louder = document.querySelector('#volume-up');
const statusLine = document.querySelector('#song-status');
const video = document.querySelector('.project-list video');
const songId = 'agneRtEe-t8';
let player;
let loading = false;
let ready = false;
let level = 40;
let resumeAfterVideo = false;

function setLevel(value) {
  level = Math.min(100, Math.max(0, value));
  player.setVolume(level);
  if (level > 0) player.unMute();
  document.querySelector('#song-volume').value = level + '%';
  quieter.disabled = level === 0;
  louder.disabled = level === 100;
}

function playSong() {
  if (video && !video.paused && !video.ended) {
    resumeAfterVideo = true;
    statusLine.textContent = 'เพลงจะเล่นเมื่อหยุดวิดีโอโปรเจกต์';
  } else {
    player.playVideo();
  }
}

function stopSong() {
  resumeAfterVideo = false;
  if (ready) player.cueVideoById(songId, 0);
  statusLine.textContent = '';
}

window.onYouTubeIframeAPIReady = () => {
  player = new YT.Player('song-player', {
    videoId: songId,
    playerVars: { playsinline: 1, origin: location.origin },
    events: {
      onReady() {
        ready = true;
        play.disabled = stop.disabled = false;
        setLevel(level);
        statusLine.textContent = '';
      },
      onStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
          if (!musicBox.open) { stopSong(); return; }
          if (video && !video.paused && !video.ended) {
            resumeAfterVideo = true;
            player.pauseVideo();
          } else statusLine.textContent = '';
        }
      },
      onError() { statusLine.textContent = 'เล่นเพลงในหน้านี้ไม่ได้ กรุณาเปิดใน YouTube Music'; },
      onAutoplayBlocked() { statusLine.textContent = 'แตะปุ่มเล่นบนตัววิดีโอเพื่อเริ่มฟัง'; }
    }
  });
};
musicBox.addEventListener('toggle', () => {
  if (!musicBox.open) { stopSong(); return; }
  if (loading) return;
  loading = true;
  statusLine.textContent = 'กำลังโหลดเครื่องเล่น…';
  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  script.onerror = () => {
    loading = false;
    script.remove();
    statusLine.textContent = 'โหลดเครื่องเล่นไม่ได้ เปิดเพลงผ่าน YouTube Music ได้ด้านล่าง';
  };
  document.head.append(script);
});
play.addEventListener('click', playSong);
stop.addEventListener('click', stopSong);
quieter.addEventListener('click', () => setLevel(player.getVolume() - 10));
louder.addEventListener('click', () => setLevel(player.getVolume() + 10));
video?.addEventListener('play', () => {
  if (ready && [YT.PlayerState.PLAYING, YT.PlayerState.BUFFERING].includes(player.getPlayerState())) {
    resumeAfterVideo = true;
    player.pauseVideo();
  }
});
function resumeSong() {
  if (resumeAfterVideo && ready && musicBox.open) {
    resumeAfterVideo = false;
    playSong();
  }
}
video?.addEventListener('pause', resumeSong);
video?.addEventListener('ended', resumeSong);
