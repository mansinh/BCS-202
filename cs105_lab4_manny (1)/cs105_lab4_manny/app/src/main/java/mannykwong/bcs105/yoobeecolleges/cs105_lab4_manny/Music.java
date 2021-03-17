package mannykwong.bcs105.yoobeecolleges.cs105_lab4_manny;

import android.content.Context;
import android.media.MediaPlayer;

//Handles the music in the shapes game
public class Music {
    public static MediaPlayer musicPlayer;
    public static boolean isPlaying = true;

    public static void setUp(Context context){
        //Set up media player if there is no instance of it
        if(musicPlayer == null) {
            try {
                musicPlayer = MediaPlayer.create(context, R.raw.background);
                musicPlayer.setLooping(true);
                musicPlayer.setVolume(0.5f, 0.5f);
                playMusic();
            }
            catch (Exception e){

            }
        }

    }

    public static void playMusic(){
        if(musicPlayer != null) {
            musicPlayer.start();
            isPlaying = true;
        }
    }

    public static void stopMusic(){
        if(musicPlayer != null) {
            musicPlayer.pause();
            isPlaying = false;
        }
    }

}
