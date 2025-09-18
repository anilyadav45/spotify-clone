const audio = document.getElementById("player");
const playPauseBtn = document.getElementById("playPause");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const progressBar = document.getElementById("progressBar");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");
const box = document.getElementById("box");

let songs = [];
let current = 0;
let isPlaying = false;

// Fetch songs from backend
fetch("http://localhost:5000/spotify/songs")
  .then(res => res.json())
  .then(data => {
    songs = data;
    if (songs.length > 0) {
      loadSong(current);
    }
  });

// Load song
function loadSong(index) {
  const song = songs[index];
  if (!song) return;
  audio.src = song.fileUrl;
  songTitle.textContent = song.title || "Unknown Title";
  songArtist.textContent = song.artist || "Unknown Artist";
  if (isPlaying) audio.play();
}

// Play / Pause toggle
playPauseBtn.addEventListener("click", () => {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    playPauseBtn.classList.remove("fa-pause-circle");
    playPauseBtn.classList.add("fa-play-circle");
  } else {
    audio.play();
    isPlaying = true;
    playPauseBtn.classList.remove("fa-play-circle");
    playPauseBtn.classList.add("fa-pause-circle");
  }
});

// Next / Prev
nextBtn.addEventListener("click", () => {
  current = (current + 1) % songs.length;
  loadSong(current);
});

prevBtn.addEventListener("click", () => {
  current = (current - 1 + songs.length) % songs.length;
  loadSong(current);
});

// Update progress bar
audio.addEventListener("timeupdate", () => {
  if (audio.duration) {
    progressBar.value = (audio.currentTime / audio.duration) * 100;
  }
});

// Seek on progress bar change
progressBar.addEventListener("input", () => {
  if (audio.duration) {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  }
});

// Auto play next when song ends
audio.addEventListener("ended", () => {
  nextBtn.click();
});
