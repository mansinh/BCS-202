package mannykwong.bcs105.yoobeecolleges.cs105_lab3_manny_kwong;

import android.content.Intent;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

public class About extends AppCompatActivity {
    Button musicButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_about);
        musicButton = findViewById(R.id.musicButtonAbout);

        //If music is muted or playing from last activity with the button
        if(Music.isPlaying) {
            musicButton.setBackground(getResources().getDrawable(R.drawable.sound_on));
        }
        else{
            musicButton.setBackground(getResources().getDrawable(R.drawable.sound_off));
        }
    }

    public void returnToMenu(View view){
        Intent i = new Intent(this,GameMenu.class);
        startActivity(i);
    }

    public void onMusicButton(View view){

        if(Music.isPlaying) {
            //Toggle music off
            musicButton.setBackground(getResources().getDrawable(R.drawable.sound_off));
            Music.stopMusic();

        }
        else{
            //Toggle music on
            musicButton.setBackground(getResources().getDrawable(R.drawable.sound_on));
            Music.playMusic();
        }
    }
}