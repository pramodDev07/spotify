let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/info.json`);
  let response = await a.json();
  songs = response.songs;

  // Show all the songs in the playlist
  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `
      <li data-file="${song}">
        <img class="invert" src="img/music.svg" alt="music">
        <div class="info">
          <div>${decodeURIComponent(song)}</div>
          <div>Artist: Pramod</div>
        </div>
        <div class="playNow">
          <span>Play Now</span>
          <img class="invert" src="img/play.svg" alt="">
        </div>
      </li>`;
  }

  // Click listeners for songs
  document.querySelectorAll(".songList li").forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.dataset.file);
    });
  });

  return songs;
}


function playMusic(songName, pause = false) {
  if (!songName) {
    console.error("No song name provided!");
    return;
  }

  // Pause and reset the previous song if playing
  currentSong.pause();
  currentSong.currentTime = 0;

  // Set new source
  currentSong.src = `/${currFolder}/${songName}`;

  // Start playing if not paused
  if (!pause) {
    currentSong.play().catch((err) => {
      console.warn("play() interrupted:", err);
    });
    play.src = "img/pause.svg";
  }

  document.querySelector(".songInfo").innerHTML = decodeURIComponent(songName);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}




async function displayAlbums() {
  let a = await fetch("/songs/albums.json");
  let response = await a.json();
  let albums = response.albums;

  let cardContainer = document.querySelector(".cardContainer");

  for (let folder of albums) {
    let albumInfo = await fetch(`/songs/${folder}/info.json`);
    let info = await albumInfo.json();

    cardContainer.innerHTML += `
      <div data-folder="${folder}" class="card">
        <div class="play">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
            <circle cx="24" cy="24" r="22" fill="#1ed760" />
            <path d="M18 14l14 10-14 10V14z" fill="black" />
          </svg>
        </div>
        <img src="/songs/${folder}/${info.cover}" alt="image">
        <h2>${info.title}</h2>
        <p>${info.description}</p>
      </div>`;
  }

  document.querySelectorAll(".card").forEach((e) => {
    e.addEventListener("click", async () => {
      let album = e.dataset.folder;
      let infoRes = await fetch(`/songs/${album}/info.json`);
      let info = await infoRes.json();
      currFolder = `songs/${album}`;
      songs = info.songs;
      if (songs.length > 0) playMusic(songs[0]);
    });
  });
}


async function main() {
  // get the list of all the songs
  console.log("songs/ncs start")
  await getSongs("songs/ncs");
  playMusic(songs[0], true);
  console.log("songs/ncs end")

  // Display all the albums on the page
  displayAlbums();

 

  // Attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for timeUpDate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to seekBar
  document.querySelector(".seekBar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-130%";
  });

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    console.log("previous checked");
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    console.log("next checked");
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event listener to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value, "/100");
      currentSong.volume = parseInt(e.target.value) / 100;
      if(currentSong.volume>0){
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg") ;
      }
    });

  // Add event listener ot mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    // console.log(e)
    // console.log("changing", e.target.src)
    if (e.target.src.includes("img/volume.svg")) {
      e.target.src = "img/mute.svg";
      // e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = "img/volume.svg";
      // e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
