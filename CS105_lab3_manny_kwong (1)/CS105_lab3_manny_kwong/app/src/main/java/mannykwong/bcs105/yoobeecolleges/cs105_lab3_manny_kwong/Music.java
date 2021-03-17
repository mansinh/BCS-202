package mannykwong.bcs105.yoobeecolleges.cs105_lab3_manny_kwong;

import android.content.Context;
import android.media.MediaPlayer;

//Handles the music in the shapes game
public class Music {
    public static MediaPlayer musicPlayer;
    public static boolean isPlaying = true;

    public static void setUp(Context context){
        //Set up media player if there is no instance of it
        if(musicPlayer == null) {
            musicPlayer = MediaPlayer.create(context, R.raw.music);
            musicPlayer.setLooping(true);
            musicPlayer.setVolume(0.8f,0.8f);
            playMusic();
        }

    }

    public static void playMusic(){
        musicPlayer.start();
        isPlaying = true;
    }

    public static void stopMusic(){
        musicPlayer.pause();
        isPlaying = false;
    }

}
