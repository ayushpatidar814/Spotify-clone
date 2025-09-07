const playBtn = document.getElementById("play");
const previous = document.getElementById("previous");
const next = document.getElementById("next");

let currentSong = new Audio();
let songs = [];
let currFolder = "";
let songData = {};


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

async function loadSongData(){
    const res = await fetch("/songs.json");
    songData = await res.json();
}

async function getSongs(folder) {
    if (!songData[folder]) {
        console.error(`Folder "${folder}" not found in songs.json`);
        return [];
    }
    songs = songData[folder].tracks;
    currFolder = folder;


    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    const data = songData[folder];
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li class="cardlist"><img class="invert" width="16" src="svgs/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>${data.author}</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="svgs/play.svg" alt="">
                            </div> </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })

    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/songs/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play()
        play.src = "svgs/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    console.log("displaying albums")
    const cardContainer = document.querySelector(".cardContainer");

    for (const folder in songData){
        const data = songData[folder];
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${data.title}</h2>
            <p>${data.description}</p>
        </div>`
        }
    

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            const folder = item.currentTarget.dataset.folder;
            console.log("Fetching Songs", folder)
            songs = await getSongs(folder)  
            playMusic(songs[0])

        })
    })
}

async function main() {

    
    // Get the list of all the songs
    await loadSongData();
    await getSongs("01-latest")
    playMusic(songs[0], true)

    // Display all the albums on the page
    displayAlbums()

    if(playBtn) {
    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "svgs/pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "svgs/play.svg";
        }
        });
    }

    if(previous) {
        previous.addEventListener("click", () => {
            currentSong.pause();
            console.log("Previous clicked");
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if ((index - 1) >= 0) {
                playMusic(songs[index - 1]);
            } else{
                currentSong.play();
            }
        });
    }

    if(next) {
        next.addEventListener("click", () => {
            currentSong.pause();
            console.log("Next clicked");
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1]);
            } else{
                currentSong.play();
            }
        });
    }

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volumebar>img").src = document.querySelector(".volumebar>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volumebar>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })

}

main() 