class Sounds{
    squishSounds;
    constructor(){
        this.squishSounds = [];
        this.squishSounds.push(new Sound("515619__mrickey13__splat-squish-2.wav"));
        this.squishSounds.push(new Sound("515619__mrickey13__splat-squish-2.wav"));
        this.squishSounds.push(new Sound("515619__mrickey13__splat-squish-2.wav"));
        this.squishSounds.push(new Sound("515619__mrickey13__splat-squish-2.wav"));
        this.squishSounds.push(new Sound("515619__mrickey13__splat-squish-2.wav"));
        this.squishSounds.push(new Sound("515619__mrickey13__splat-squish-2.wav"));
    }
    

    playSquishSound(){
        for(let i = 0; i < this.squishSounds.length;i++){
            if(this.squishSounds[i].isPaused()){
                this.squishSounds[i].play();
                console.log("play "+i);
                break;
            }
        }
    }
}

class Sound{
    sound;
    constructor(src){
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload","auto");
        this.sound.setAttribute("controls","none")
        this.sound.style.display = "none";
        this.sound.volume = 0.1;
        document.body.appendChild(this.sound);
    }
    play() {
        this.sound.play();
    }

    isPaused(){
        return this.sound.paused;
    }
}