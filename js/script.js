console.log('Lets start the script....');
//Global variable currentSong which has the current song
let currentSong = new Audio()
let currentFolder
let songs = []
let songsUL = document.querySelector(".song-list")

document.title = 'Melodify - Music for everybody'

async function getSongs(folder){
    //Get the list of songs
    currentFolder = folder
    let a = await fetch(`/${folder}`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    for (const i of anchors) {
        if(i.href.endsWith(".mp3") == true){
            songs.push(i.href.split(`/${folder}/`,2)[1])
        }
    }

    //Show all the songs in the playlist
    for (const song of songs) {
        let li = document.createElement("li")
        li.innerHTML = `<img src="assets/music.svg" alt="">
                        <div class="info">
                            <div>${decodeURI(song)}</div>
                        </div>
                        <div class="playnow flex justify-center items-center">
                            <span>Play Now</span>
                            <img src="assets/play.svg" alt="">
                        </div>`

        songsUL.append(li)
    }
    playMusic(songs[0], true)

    //Attach an event listener to each song.
    Array.from(songsUL.getElementsByTagName("li")).forEach((e)=>{
        e.addEventListener("click",()=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })
}

function playMusic(track, pause = false){
    currentSong.src = `${currentFolder}/` + track
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00: 00"
    if(!pause){
        currentSong.play()
        play.src = "assets/pause.svg"
    }
}

//Function to convert seconds to minutes: seconds format
function secondsToMinutesSeconds(seconds) {

    // Check if seconds is not a number
    if (isNaN(seconds)) {
        return "00: 00";
    }

    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    return (minutes<10 ? '0' : '') + minutes + " : " + (remainingSeconds<10 ? '0' : '') + Math.floor(remainingSeconds) + "";
}


async function displayAlbums(){
    let a = await fetch(`/songs`)
    let response = await a.text()
    let cardContainer = document.getElementsByClassName("cardContainer")[0]
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    for (const a of anchors) {
        if(a.href.includes("songs") && !a.href.includes(".htaccess")){
            let folder = a.href.split("/").slice(4)[0]
            //Get meta data of each album from it's folder.
            let b = await fetch(`/songs/${folder}/info.json`)
            let response = await b.json()
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none">
                <!-- Circle with black background -->
                <circle cx="12" cy="12" r="12" fill="#1ED760" />
                <!-- Triangle with white background pointing to the right -->
                <path d="M9 7L17 12L9 17V7Z" fill="#000000" />
            </svg>
            <img src="songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
}

async function main(){

    await getSongs(`songs/ncs`)

    //Display all the albums on the page
    await displayAlbums()

    //Attach an event listener to play, next and previous
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "assets/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "assets/play.svg"
        }
    })

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").setAttribute("position",`relative`)
        document.querySelector(".circle").style.left = `${(currentSong.currentTime/currentSong.duration)*100}%`
    })

    //Add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left = `${percent}%`
        currentSong.currentTime = (percent/100)*(currentSong.duration)
    })

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0%"
    })

    //Add an event listener for close
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-100%"
    })

    //Add an event listener to previous and next
    previous.addEventListener("click",()=>{
        //Array a is created using HTML collection containing all list elements inside song list.
        let a = Array.from(songsUL.getElementsByTagName("li"))
        //Here b is list of song names (tracks) which is created using array a
        let b = a.map((song)=>{
            return song.querySelector(".info").getElementsByTagName("div")[0].textContent
        })
        //Track name is extracted from src of current song.
        let currentSong_id = b.indexOf(decodeURI(currentSong.src.split("/")[5]))
        //previous inside this block is local variable inside the callback function of this event
        let previous = currentSong_id - 1;
        if(previous>=0){
            currentSong.pause()
            playMusic(b[previous])
        }
        else{
            previous = b.length - 1
            currentSong.pause()
            playMusic(b[previous])
        }
    })

    next.addEventListener("click",()=>{
        //Array a is created using HTML collection containing all list elements inside song list.
        let a = Array.from(songsUL.getElementsByTagName("li"))
        //Here b is list of song names (tracks) which is created using array a
        let b = a.map((song)=>{
            return song.querySelector(".info").getElementsByTagName("div")[0].textContent
        })
        //Track name is extracted from src of current song.
        let currentSong_id = b.indexOf(decodeURI(currentSong.src.split("/")[5]))
        //next inside this block is local variable inside the callback function of this event
        let next = currentSong_id + 1;
        if(next<(b.length-1)){
            currentSong.pause()
            playMusic(b[next])
        }
        else{
            currentSong.pause()
            next = (next)%(b.length)
            playMusic(b[next])
        }
    })

    //Add an event listener on volume slider
    volume.addEventListener("change",(e)=>{
        console.log('Setting volume to '+ e.target.value);
        currentSong.volume = parseInt(e.target.value)/100
        if(currentSong.volume>0){
            document.querySelector(".vol>img").src = "assets/volume.svg";
        }
    })

    //Add an event listener on card
    Array.from(document.getElementsByClassName("card")).forEach((card)=>{
        card.addEventListener("click",async (e)=>{
            currentFolder = e.currentTarget.dataset.folder
            songsUL.innerHTML = ``
            songs = []
            await getSongs(`songs/${currentFolder}`)
            play.src = "assets/pause.svg"
            currentSong.pause()
            playMusic(songs[0])
        })
    })

    //Add an event listener on volume button for muting and unmuting the songs.
    document.querySelector(".vol>img").addEventListener("click", e =>{

        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg") 
            currentSong.volume = 0
            document.getElementById("volume").value = 0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg") 
            currentSong.volume = 10/100
            document.getElementById("volume").value = 10
        }
    })

}
 
main()

