var currentSong = new Audio();
let play = document.getElementById('play');
let previous = document.getElementById('previous');
let next = document.getElementById('next');
var songUrls = {}; // To store song names and URLs
var songNameAlbum = []; // Store names of songs
let playlists = []; // Store the folder names of songs
var i = 0;
let currFolder = "Entertainment";

const UpdatedUrl = [
  {
    category: "Bhajan",
    songs: [
      "songs/Bhajan/Bajrang%20Baan%20Lofi_64(PagalWorld.com.sb).mp3",
      "songs/Bhajan/Hanuman%20Chalisa_192(PagalWorld.com.sb).mp3"
    ]
  },
  {
    category: "Entertainment",
    songs: [
      "songs/Entertainment/_Tu%20Hai%20Kahan_64(PagalWorld.com.sb).mp3",
      "songs/Entertainment/Aayi%20Nai_64(PagalWorld.com.sb).mp3",
      "songs/Entertainment/Bhool%20Bhulaiyaa%203_192(PagalWorld.com.sb).mp3",
      "songs/Entertainment/Dil%20Tu%20Jaan%20Tu_64(PagalWorld.com.sb).mp3"
    ]
  },
  {
    category: "Motivational",
    songs: ["songs/Motivational/Millionaire_64(PagalWorld.com.sb).mp3"]
  }
];

// Fetch all album names (folder names) in the song playlist and store them in playlists array
async function loadPlaylists() {
    playlists = [
        'songs/Bhajan/info.json',
        'songs/Entertainment/info.json',
        'songs/Motivational/info.json'
    ];
}

// Fetch data of each folder/playlist in songs
const getCardData = async (filePath) => {
    const response = await fetch(filePath);
    if (!response.ok) {
        throw new Error(`Could not fetch data from ${filePath}`);
    }
    return await response.json();
};

// Load all playlists and dynamic cards
async function populateCards() {
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = ""; // Clear existing content

    for (const filePath of playlists) {
        try {
            const data = await getCardData(filePath);
            cardContainer.insertAdjacentHTML('beforeend', `
                <div class="card" data-folder="${data.folderName}">
                    <div class="play">
                        <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="45" fill="#00C853" />
                            <polygon points="40,30 40,70 70,50" fill="black" />
                        </svg>
                    </div>
                    <img src="${data.imagesrc}" alt="Album Cover">
                    <h2>${data.title}</h2>
                    <p>${data.description}</p>
                </div>
            `);
        } catch (error) {
            console.error(error);
        }
    }
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

const playSong = (songToPlay, musicToPlay) => {
    currentSong.src = songToPlay;
    currentSong.play();
    play.src = "./img/pause.svg";
    document.querySelector(".songinfo").innerText = musicToPlay;
    document.querySelector(".songtime").innerText = '00:00';
};

const getSongs = (currFolder) => {
    return UpdatedUrl.find(item => item.category === currFolder)?.songs || [];
}

const getSongName = (url) => {
    return url
        .split('/').pop()
        .replace('.mp3', '')
        .replace(/_/g, ' ')
        .replace(/%20/g, ' ')
        .replace(/\d+/g, '')
        .replace(/\s*\(.*?\)\s*/g, '');
};

async function loadSongLists(currFolder) {
    let songs = getSongs(currFolder);
    let songUl = document.querySelector('.song-list').getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    songUrls = {}; // Resetting the songUrls object
    songNameAlbum = []; // Resetting the songNameAlbum array
    i = 0; // Resetting index

    for (const song of songs) {
        const url = song;
        const songName = getSongName(url);
        songUrls[songName] = url;
        songNameAlbum[i++] = songName;
        
        songUl.innerHTML += `
            <li>
                <img class="invert" src="./img/music.svg" alt="">
                <div class="info">
                    <div>${songName}</div>
                </div>
                <div class="playnow">
                    <img class="invert" src="./img/play.svg" alt="">
                </div> 
            </li>`;
    }

    if (songNameAlbum.length > 0) {
        let prevSongToPlay = songNameAlbum[0];
        playSong(songUrls[prevSongToPlay], prevSongToPlay);
    }

    // Clear previous event listeners
    Array.from(document.querySelector('.song-list').getElementsByTagName('li')).forEach(element => {
        element.replaceWith(element.cloneNode(true)); // Recreate element to remove event listeners
    });

    // Add new event listeners to each song item
    Array.from(document.querySelector('.song-list').getElementsByTagName('li')).forEach(element => {
        element.addEventListener('click', () => {
            let musicName = element.querySelector('.info div').innerText.trim();
            playSong(songUrls[musicName], musicName);
        });
    });
}

async function main() {
    await loadPlaylists();
    await populateCards();
    await loadSongLists(currFolder);

    Array.from(document.querySelectorAll('.card')).forEach((ele) => {
        ele.addEventListener("click", async (e) => {
            currFolder = e.currentTarget.getAttribute('data-folder');
            await loadSongLists(currFolder); // Ensure songs are loaded asynchronously
        });
    });

    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "./img/play.svg";
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector('.left').style.left = '0%';
    });

    // Close bar
    document.querySelector(".closebar").addEventListener("click", () => {
        document.querySelector('.left').style.left = '-120%';
    });

    // Previous song
    previous.addEventListener("click", () => {
        let playingSong = getSongName(currentSong.src);
        let index = songNameAlbum.findIndex(song => song === playingSong);
        if (index > 0) {
            let prevSongToPlay = songNameAlbum[index - 1];
            playSong(songUrls[prevSongToPlay], prevSongToPlay);
        } else {
            let prevSongToPlay = songNameAlbum[songNameAlbum.length - 1];
            playSong(songUrls[prevSongToPlay], prevSongToPlay);
        }
    });

    // Next song
    next.addEventListener("click", () => {
        let playingSong = getSongName(currentSong.src);
        let index = songNameAlbum.findIndex(song => song === playingSong);
        if (index < songNameAlbum.length - 1) {
            let nextSongToPlay = songNameAlbum[index + 1];
            playSong(songUrls[nextSongToPlay], nextSongToPlay);
        } else {
            let nextSongToPlay = songNameAlbum[0];
            playSong(songUrls[nextSongToPlay], nextSongToPlay);
        }
    });

    // Volume control
    document.querySelector('.range input').addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });
}

main();
