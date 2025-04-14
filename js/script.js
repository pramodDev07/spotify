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
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // show all the songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `
    <li> <img class="invert" src="img/music.svg" alt="music">
        <div class="info">
           <div>${decodeURIComponent(
             song
               // .replaceAll("_320", "")
               .replaceAll("%20", " ")
             // .replaceAll("(PagalWorld.com.so)", "")
           )}
           </div>
           <div>Artist: Pramod</div>
       </div>
            <div class="playNow">
               <span>Play Now </span>
               <img class="invert"  src="img/play.svg" alt="">
            </div> 
      </li>`;
  }
   // Attach an event listener to each song
   Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });

    // e.addEventListener("click", () => {
    //   let songName = e
    //     .querySelector(".info")
    //     .firstElementChild.innerHTML.trim();
    //   let songFile = songs.find(
    //     (song) =>
    //       decodeURIComponent(
    //         song
    //           // .replaceAll("_320", "")
    //           .replaceAll("%20", " ")
    //           // .replaceAll("(PagalWorld.com.so)", "")
    //       ) === songName
    //   );
    //   if (songFile) {
    //     playMusic(songFile);
    //   }
    // });
  });
  return songs;
}

const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track)
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }

  document.querySelector(".songInfo").innerHTML = decodeURIComponent(
    track
      // .replaceAll("_320", "")
      .replaceAll("%20", " ")
    // .replaceAll("(PagalWorld.com.so)", "")
  );
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  // console.log(div);
  let anchors = div.getElementsByTagName("a");
  // console.log(anchors);
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    console.log(e.href,'he href')
    if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
      // console.log(e.href)
      // console.log(e.href.split("/").slice(-2)[0])
      let folder = e.href.split("/").slice(-1)[0];
      // Get the metadata of the folder
      console.log('he ncs')
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      // console.log(response);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `   <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
                                <circle cx="24" cy="24" r="22" fill="#1ed760" />
                                <path d="M18 14l14 10-14 10V14z" fill="black" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="image">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
    }
  }
  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("Fetching Songs");
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  // get the list of all the songs
  console.log("songs/ncs")
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

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
