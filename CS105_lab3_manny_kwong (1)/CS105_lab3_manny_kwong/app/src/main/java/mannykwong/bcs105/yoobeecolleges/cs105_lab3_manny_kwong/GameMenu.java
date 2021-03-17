package mannykwong.bcs105.yoobeecolleges.cs105_lab3_manny_kwong;

import android.animation.ObjectAnimator;
import android.content.Intent;
import android.media.MediaPlayer;
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
        shapeLogo = findViewById(R.id.shapeLogo);

        int circle = R.drawable.circle;
        int diamond = R.drawable.diamond;
        int heart = R.drawable.heart;
        int oval = R.drawable.oval;
        int pentagon = R.drawable.pentagon;
        int rectangle = R.drawable.rectangle;
        int star = R.drawable.star;
        int triangle = R.drawable.triangle;

        shapeColors = new int[]{R.color.colorBlue,R.color.colorGreen,R.color.colorMagenta,R.color.colorOrange,R.color.colorPurple,R.color.colorYellow};
        shapeIDPool = new int[]{triangle,circle, diamond, heart, oval, pentagon, rectangle, star};

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
        jumpingShapeAnim();

        //Switch shape image every 6 seconds
        shapeIndex++;
        if(shapeIndex == shapeIDPool.length){
            shapeIndex = 0;
        }
        shapeLogo.setImageDrawable(getResources().getDrawable(shapeIDPool[shapeIndex]));

        //Random colour
        shapeLogo.setColorFilter(getResources().getColor(shapeColors[(int)(shapeColors.length*Math.random())]));


    }

    void jumpingShapeAnim(){
        //keeps bottom on the same level when squashing in the y direction
        float dispY = shapeLogo.getHeight()*0.1f;

        ObjectAnimator jump = ObjectAnimator.ofFloat(shapeLogo,"translationY",0,dispY/2,dispY/2,0,-100,-110,-115,-110,-100,0,dispY,dispY,0);
        ObjectAnimator squashX = ObjectAnimator.ofFloat(shapeLogo,"scaleX",1,1.1f,1.1f,0.8f,1,1,1,1.2f,1);
        ObjectAnimator squashY = ObjectAnimator.ofFloat(shapeLogo,"scaleY",1,0.9f,0.9f,1f,1,1,1,0.8f,1);
        jump.setDuration(2000);
        squashX.setDuration(2000);
        squashY.setDuration(2000);
        squashX.start();
        squashY.start();
        jump.start();
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
