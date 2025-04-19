const appState = {
    playlists: { "Default": [] },
    currentPlaylistName: "Default",
    currentIndex: 0,
    playing: false,
    paused: false,
    shuffle: false,
    repeat: false,
    audio: new Audio(),
    volume: 0.5,
};

const elements = {
    sidebarButtons: document.querySelectorAll('.nav-btn'),
    mainContent: document.getElementById('main-content'),
    nowPlayingLabel: document.getElementById('now-playing'),
    playPauseBtn: document.getElementById('play-pause-btn'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    shuffleBtn: document.getElementById('shuffle-btn'),
    repeatBtn: document.getElementById('repeat-btn'),
    volumeSlider: document.getElementById('volume-slider'),
    progressSlider: document.getElementById('progress-slider'),
    currentTimeLabel: document.getElementById('current-time'),
    totalTimeLabel: document.getElementById('total-time'),
    fileInput: document.getElementById('file-input'),
};

function formatTime(seconds) {
    return Math.floor(seconds / 60) + ':' + Math.floor(seconds % 60).toString().padStart(2, '0');
}

function updateNowPlaying() {
    const playlist = appState.playlists[appState.currentPlaylistName];
    elements.nowPlayingLabel.textContent = playlist.length && appState.currentIndex < playlist.length
        ? "Now Playing: " + playlist[appState.currentIndex].name
        : "Now Playing: None";
}

function loadSong(index) {
    const playlist = appState.playlists[appState.currentPlaylistName];
    if (index < 0 || index >= playlist.length) return;
    appState.currentIndex = index;
    appState.playing = true;
    appState.paused = false;
    appState.audio.src = playlist[index].url;
    appState.audio.volume = appState.volume;
    appState.audio.play();
    elements.playPauseBtn.textContent = "⏸";
    updateNowPlaying();
}

function playPauseToggle() {
    if (!appState.playing) {
        loadSong(appState.currentIndex);
    } else {
        if (appState.paused) {
            appState.audio.play();
            elements.playPauseBtn.textContent = "⏸";
        } else {
            appState.audio.pause();
            elements.playPauseBtn.textContent = "▶";
        }
        appState.paused = !appState.paused;
    }
}

function changeSong(direction) {
    const playlist = appState.playlists[appState.currentPlaylistName];
    if (!playlist.length) return;
    let nextIndex = (appState.currentIndex + direction + playlist.length) % playlist.length;
    loadSong(nextIndex);
}

function updateProgress() {
    const { currentTime, duration } = appState.audio;
    if (duration) {
        elements.progressSlider.max = duration;
        elements.progressSlider.value = currentTime;
        elements.currentTimeLabel.textContent = formatTime(currentTime);
        elements.totalTimeLabel.textContent = formatTime(duration);
    }
    requestAnimationFrame(updateProgress);
}

function showView(view) {
    elements.mainContent.innerHTML = "";
    elements.sidebarButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
    if (view === "home") {
        showHome();
    } else if (view === "library") {
        showLibrary();
    }
}

function showHome() {
    const playlist = appState.playlists[appState.currentPlaylistName];
    if (!playlist.length) {
        elements.mainContent.textContent = "No songs available. Add songs in Your Library.";
        return;
    }
    const grid = document.createElement("div");
    grid.className = "song-grid";
    playlist.forEach((song, index) => {
        const btn = document.createElement("button");
        btn.className = "song-button";
        btn.textContent = song.name;
        btn.title = song.name;
        btn.onclick = () => loadSong(index);
        grid.appendChild(btn);
    });
    elements.mainContent.appendChild(grid);
}

function showLibrary() {
    const playlist = appState.playlists[appState.currentPlaylistName];
    elements.mainContent.innerHTML = "";
    const addSongsBtn = document.createElement("button");
    addSongsBtn.textContent = "Add Songs";
    addSongsBtn.onclick = () => elements.fileInput.click();
    elements.mainContent.appendChild(addSongsBtn);

    const listbox = document.createElement("div");
    listbox.className = "listbox";
    playlist.forEach((song, index) => {
        const item = document.createElement("div");
        item.className = "listbox-item";
        item.textContent = song.name;
        item.onclick = () => loadSong(index);
        listbox.appendChild(item);
    });
    elements.mainContent.appendChild(listbox);

    elements.fileInput.onchange = (e) => {
        const files = e.target.files;
        const currentPlaylist = appState.playlists[appState.currentPlaylistName];
        Array.from(files).forEach(file => currentPlaylist.push({ name: file.name, url: URL.createObjectURL(file) }));
        showLibrary();
    };
}

function skipForward(seconds = 10) {
    if (appState.audio.duration) {
        appState.audio.currentTime = Math.min(appState.audio.currentTime + seconds, appState.audio.duration);
    }
}

function skipBackward(seconds = 10) {
    appState.audio.currentTime = Math.max(appState.audio.currentTime - seconds, 0);
}

function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        switch (e.code) {
            case 'ArrowRight':
                skipForward(10);
                e.preventDefault();
                break;
            case 'ArrowLeft':
                skipBackward(10);
                e.preventDefault();
                break;
            case 'Space':
                playPauseToggle();
                e.preventDefault();
                break;
        }
    });
}

function init() {
    elements.sidebarButtons.forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));
    elements.playPauseBtn.addEventListener('click', playPauseToggle);
    elements.prevBtn.addEventListener('click', () => changeSong(-1));
    elements.nextBtn.addEventListener('click', () => changeSong(1));
    elements.volumeSlider.addEventListener('input', (e) => {
        appState.audio.volume = appState.volume = parseFloat(e.target.value);
    });
    elements.progressSlider.addEventListener('input', (e) => {
        appState.audio.currentTime = e.target.value;
    });
    appState.audio.addEventListener('ended', () => {
        if (appState.repeat) {
            loadSong(appState.currentIndex);
        } else {
            changeSong(1);
        }
    });
    updateProgress();
    showView("home");
    setupKeyboardShortcuts();
}

window.onload = init;
