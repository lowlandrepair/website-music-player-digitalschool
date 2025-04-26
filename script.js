const songsList = [
    { name: "Coldplay - Sparks", url: "songs/Coldplay - Sparks.mp3", artist: "Coldplay", album: "Parachutes", year: "2000", genre: "Alternative" },
    { name: "Kendrick Lamar - Not Like Us (Lyrics) Drake Diss", url: "songs/Kendrick Lamar - Not Like Us (Lyrics) Drake Diss.mp3", artist: "Kendrick Lamar", album: "Not Like Us", year: "2024", genre: "Hip-Hop" },
    { name: "Lil Tecca feat. Juice WRLD - Ransom (Official Audio)", url: "songs/Lil Tecca feat. Juice WRLD - Ransom (Official Audio).mp3", artist: "Lil Tecca, Juice WRLD", album: "We Love You Tecca", year: "2019", genre: "Hip-Hop" },
    { name: "Outkast - Ms. Jackson (Official HD Video)", url: "songs/Outkast - Ms. Jackson (Official HD Video).mp3", artist: "Outkast", album: "Stankonia", year: "2000", genre: "Hip-Hop" },
    { name: "The Weeknd Timeless with Playboi Carti (Official Music Video)", url: "songs/The Weeknd Timeless with Playboi Carti (Official Music Video).mp3", artist: "The Weeknd, Playboi Carti", album: "Hurry Up Tomorrow", year: "2024", genre: "R&B" },
    { name: "A. Cooper - Birthdays Arent Fun Anymore", url: "songs/A. Cooper - Birthdays Arent Fun Anymore.mp3", artist: "A. Cooper", album: "Unknown", year: "Unknown", genre: "Indie" },
    { name: "Zane Little - Got a Feeling", url: "songs/Zane Little - Got a Feeling.mp3", artist: "Zane Little", album: "Unknown", year: "Unknown", genre: "Indie" },
    { name: "Zane Little - Ill-Fated Fantasy", url: "songs/Zane Little - Ill-Fated Fantasy.mp3", artist: "Zane Little", album: "Unknown", year: "Unknown", genre: "Indie" },
];

const appState = {
    playlists: { "Default": songsList },
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
    } else if (view === "song-detail") {
        showSongDetail(appState.currentIndex);
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
        btn.onclick = () => {
            appState.currentIndex = index;
            showView("song-detail");
        };
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
        item.onclick = () => {
            appState.currentIndex = index;
            showView("song-detail");
        };
        listbox.appendChild(item);
    });
    elements.mainContent.appendChild(listbox);

    elements.fileInput.onchange = (e) => {
        const files = e.target.files;
        const currentPlaylist = appState.playlists[appState.currentPlaylistName];
        Array.from(files).forEach(file => currentPlaylist.push({ 
            name: file.name, 
            url: URL.createObjectURL(file),
            artist: "Unknown",
            album: "Unknown",
            year: "Unknown",
            genre: "Unknown"
        }));
        showLibrary();
    };
}

function showSongDetail(index) {
    const playlist = appState.playlists[appState.currentPlaylistName];
    if (index < 0 || index >= playlist.length) {
        elements.mainContent.textContent = "No song selected.";
        return;
    }
    const song = playlist[index];
    const detailDiv = document.createElement("div");
    detailDiv.className = "song-detail";
    
    const title = document.createElement("h2");
    title.textContent = song.name;
    detailDiv.appendChild(title);

    const artist = document.createElement("p");
    artist.textContent = `Artist: ${song.artist}`;
    detailDiv.appendChild(artist);

    const album = document.createElement("p");
    album.textContent = `Album: ${song.album}`;
    detailDiv.appendChild(album);

    const year = document.createElement("p");
    year.textContent = `Year: ${song.year}`;
    detailDiv.appendChild(year);

    const genre = document.createElement("p");
    genre.textContent = `Genre: ${song.genre}`;
    detailDiv.appendChild(genre);

    const playBtn = document.createElement("button");
    playBtn.textContent = "Play Song";
    playBtn.onclick = () => loadSong(index);
    detailDiv.appendChild(playBtn);

    elements.mainContent.appendChild(detailDiv);
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


        var gk_isXlsx = false;
        var gk_xlsxFileLookup = {};
        var gk_fileData = {};
        function filledCell(cell) {
          return cell !== '' && cell != null;
        }
        function loadFileData(filename) {
        if (gk_isXlsx && gk_xlsxFileLookup[filename]) {
            try {
                var workbook = XLSX.read(gk_fileData[filename], { type: 'base64' });
                var firstSheetName = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[firstSheetName];

                // Convert sheet to JSON to filter blank rows
                var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
                // Filter out blank rows (rows where all cells are empty, null, or undefined)
                var filteredData = jsonData.filter(row => row.some(filledCell));

                // Heuristic to find the header row by ignoring rows with fewer filled cells than the next row
                var headerRowIndex = filteredData.findIndex((row, index) =>
                  row.filter(filledCell).length >= filteredData[index + 1]?.filter(filledCell).length
                );
                // Fallback
                if (headerRowIndex === -1 || headerRowIndex > 25) {
                  headerRowIndex = 0;
                }

                // Convert filtered JSON back to CSV
                var csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex)); // Create a new sheet from filtered array of arrays
                csv = XLSX.utils.sheet_to_csv(csv, { header: 1 });
                return csv;
            } catch (e) {
                console.error(e);
                return "";
            }
        }
        return gk_fileData[filename] || "";
        }
