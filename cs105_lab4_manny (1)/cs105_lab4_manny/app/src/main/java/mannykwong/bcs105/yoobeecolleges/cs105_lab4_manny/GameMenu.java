package mannykwong.bcs105.yoobeecolleges.cs105_lab4_manny;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;

import androidx.appcompat.app.AppCompatActivity;

public class GameMenu extends AppCompatActivity {
    ImageView shapeLogo;
    Handler handler;
    Runnable runnable;
    int[] shapeIDPool;
    int[] shapeColors;
    int shapeIndex = 0;
    Button musicButton;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        shapeLogo = findViewById(R.id.logo);
        musicButton = findViewById(R.id.musicButtonMenu);

        //Initialize media player for music on start up
        Music.setUp(this);

        //If music is muted or playing from last activity, show so on the button
        if(Music.isPlaying) {
            musicButton.setBackground(getResources().getDrawable(R.drawable.sound_on));
        }
        else{
            musicButton.setBackground(getResources().getDrawable(R.drawable.sound_off));
        }


        handler = new Handler();
        update();
    }

    //Run animation of game logo
    public void update(){
        //Thread
        runnable = new Runnable() {
            @Override
            public void run() {
                update();
            }
        };
        handler.postDelayed(runnable, 6000);


    }


    //On click methods

    //To game
    public void onStartGame(View view){
        Intent i = new Intent(this, Game.class);
        startActivity(i);
    }

    //To intro/about
    public void onAboutGame(View view){
        Intent i = new Intent(this, About.class);
        startActivity(i);
    }

    //Toggle music
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
