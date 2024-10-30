var currentSong = new Audio();
let play = document.getElementById('play');
let previous = document.getElementById('previous');
let next = document.getElementById('next');
var songUrls = {}; //to store song names and urls
var songNameAlbum = []; //store names of songs
let playlists = []; //store the folder names of songs
var i = 0;
let currFolder = "Entertainment";


// This function will get all album names {folder names} in the song playlist 
// and store it in playlist array
async function getAlbums() {
    const fetchAlbums = await fetch(`./songs/`);
    const res = await fetchAlbums.text();
    const div = document.createElement('div');
    div.innerHTML = res;
    let as = div.getElementsByTagName("a");
    for (link of as) {
        if (link.href.includes('/songs/')) {
            console.log(link.href);
            let splitedarr = link.href.split("\songs");
            playlists.push(splitedarr[1]);
        }
    }
}
// this will fetch data of each folder/playlist  in songs 
const getCardData = async (ele) => {
    // here ele is folder name
    const cardData = await fetch(`./songs${ele}/info.json`);
    return await cardData.json();
}

// This will now load all the playlists and dynamic cards 
async function populateCards() {
    let cardContainer = document.querySelector(".cardContainer");
    // it will iterate through all folders in playlist array 
    for (const ele of playlists) {
        // the arr is an object of data of each playlist 
        let arr = await getCardData(ele);
        cardContainer.insertAdjacentHTML('beforeend', `
        <div class="card"data-folder=${arr.folderName}>
            <div class="play">
                <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <!-- Green Circle -->
                    <circle cx="50" cy="50" r="45" fill="#00C853" />
                    <!-- Black Play Triangle -->
                    <polygon points="40,30 40,70 70,50" fill="black" />
                </svg>
            </div>
            <img src="${arr.imagesrc}" alt="">
            <h2>${arr.title}!</h2>
            <p>${arr.description}</p>
        </div>
    `);
    };
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


const playSong = (songtoPlay, musicToplay) => {
    currentSong.src = songtoPlay;
    currentSong.play();
    play.src = "./img/pause.svg";
    document.querySelector(".songinfo").innerText = musicToplay;
    document.querySelector(".songtime").innerText = '00:00';

}

const getSongs = async (currFolder) => {
    const fetchSongs = await fetch(`./songs/${currFolder}/`);
    const res = await fetchSongs.text();
    const div = document.createElement("div");
    div.innerHTML = res;
    let as = div.getElementsByTagName('a');
    let songs = [];
    for (a of as) {
        if (a.href.endsWith(".mp3")) {
            songs.push(a.href);
        }
    }
    return songs;

}

const getSongName = (url) => {
    return url
        .split('/').pop()                // Get the last part of the URL
        .replace('.mp3', '')             // Remove .mp3 extension
        .replace(/_/g, ' ')              // Replace underscores with spaces
        .replace(/%20/g, ' ')            // Replace %20 with spaces
        .replace(/\d+/g, '')
        .replace(/\s*\(.*?\)\s*/g, '');
}

async function loadsongLists(currFolder) {
    let songs = await getSongs(currFolder);
    let songUl = document.querySelector('.song-list').getElementsByTagName("ul")[0];
    songUl.innerHTML="";
    for (const song of songs) {
        const url = song;
        const songName = getSongName(url);
        songUrls[`${songName}`] = url;
        songNameAlbum[i++] = songName;
        songUl.innerHTML = songUl.innerHTML + ` <li>
                                <img  class="invert" src="./img/music.svg" alt="">
                                <div class="info">
                                    <div>${songName}</div>
                                </div>
                                <div class="playnow">
                                    <img  class="invert" src="./img/play.svg" alt="">
                                </div> 
                            </li>`;
    }
    let prevSongtoPlay = songNameAlbum[0];
    playSong(songUrls[prevSongtoPlay], prevSongtoPlay);
    
    Array.from(document.querySelector('.song-list').getElementsByTagName('li')).forEach(element => {
        element.addEventListener('click', () => {
            let musicName = element.querySelector('.info').getElementsByTagName('div')[0].innerText.trim();
            playSong(songUrls[musicName], musicName);
        })
    });

}

async function main() {
    await getAlbums();
    await populateCards();
    await loadsongLists(currFolder);
    Array.from(document.querySelectorAll('.card')).forEach((ele) => {
        ele.addEventListener("click", async (e) => {
            currFolder = e.currentTarget.getAttribute('data-folder');
            i=0;
            loadsongLists(currFolder);
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
    })
    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        // console.log(e.offsetX, e.target.getBoundingClientRect().width);
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })
    // hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector('.left').style.left = '0%';
    })
    // closebar
    document.querySelector(".closebar").addEventListener("click", () => {
        document.querySelector('.left').style.left = '-120%';
    })
    // previous
    previous.addEventListener("click", () => {
        let playingSong = getSongName(currentSong.src);
        console.log(playingSong);
        let index = songNameAlbum.findIndex(song => song === playingSong);
        console.log(index);
        if (index >= 1) {
            let prevSongtoPlay = songNameAlbum[index - 1];
            playSong(songUrls[prevSongtoPlay], prevSongtoPlay);
        } else {
            let prevSongtoPlay = songNameAlbum[songNameAlbum.length - 1];
            playSong(songUrls[prevSongtoPlay], prevSongtoPlay);
        }
    });

    //next
    next.addEventListener("click", () => {
        let playingSong = getSongName(currentSong.src);
        console.log(playingSong);
        let index = songNameAlbum.findIndex(song => song === playingSong);
        // console.log(index);
        if (index < songNameAlbum.length - 1) {
            let prevSongtoPlay = songNameAlbum[index + 1];
            playSong(songUrls[prevSongtoPlay], prevSongtoPlay);
        } else {
            let prevSongtoPlay = songNameAlbum[0];
            playSong(songUrls[prevSongtoPlay], prevSongtoPlay);
        }
    });
    // volumee
    document.querySelector('.range').getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })

}




main();
