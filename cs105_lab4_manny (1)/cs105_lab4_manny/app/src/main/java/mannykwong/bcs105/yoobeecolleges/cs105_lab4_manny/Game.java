package mannykwong.bcs105.yoobeecolleges.cs105_lab4_manny;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.os.Handler;
import android.speech.tts.TextToSpeech;
import android.util.DisplayMetrics;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.constraintlayout.widget.ConstraintLayout;

import java.util.Locale;

//-----------------------------------------------------------------------------------------------------------
//Game Controller
//Initialized game, handles user input, UI, sounds
//-----------------------------------------------------------------------------------------------------------

public class Game extends AppCompatActivity {
    //UI
    TextView dayText;
    Button musicButton;
    ProgressBar healthBar;
    //float progress;

    //state variables
    boolean paused = false, showGameOver = false, gameOver = false, waveStart = false, waveEnd = false;

    int screenHeight, screenWidth;
    int day = 0, highScore;

    //misc
    MediaPlayer pointsPlayer;
    SoundEffects soundEffects;
    AlertDialog.Builder dialogBuilder;
    SharedPreferences.Editor highScoreEdit;

    //Threads
    Handler handler;
    Runnable runnable;

    //Game engine
    GameView gameView;

    //Singleton
    public static Game instance;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_game);

        //Singleton
        if(instance == null) {
            instance = this;

            //Get screen dimensions
            DisplayMetrics displayMetrics = new DisplayMetrics();
            getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
            screenHeight = displayMetrics.heightPixels;
            screenWidth = displayMetrics.widthPixels;

            //initialize
            initUI();
            initSound(this);

            //start game loop
            waveStart();
            handler = new Handler();
            updateUI();

            gameView = new GameView(this);
            ConstraintLayout gameLayout = findViewById(R.id.gameLayout);
            gameLayout.addView(gameView);
            gameView.resume();

            //Shoot when screen is tapped
            gameLayout.setOnTouchListener(new View.OnTouchListener() {
                @Override
                public boolean onTouch(View v, MotionEvent event) {
                    float touchX = event.getX();
                    float touchY = event.getY();

                    gameView.shoot(event.getX(), event.getY());
                    return false;
                }

            });
        }
    }



    //*********************************************************************************************************************************************************//
    // Initialization Methods

    void initUI(){

        //Health bar
        healthBar = findViewById(R.id.healthBar);
        updateHealth(100);

        //Score bar
        dayText = findViewById(R.id.day);

        //Load high score
        SharedPreferences pref = getSharedPreferences("HighScore", Context.MODE_PRIVATE);
        highScoreEdit = pref.edit();


        //Game over dialog box
        dialogBuilder = new AlertDialog.Builder(this,R.style.MyAlertDialog);
    }


    void initSound(Context context){
        musicButton = findViewById(R.id.musicButton);

        //If music is muted or playing from last activity with the button
        if(Music.isPlaying) {
            musicButton.setBackground(getResources().getDrawable(R.drawable.sound_on));
        }
        else{
            musicButton.setBackground(getResources().getDrawable(R.drawable.sound_off));
        }

        soundEffects = new SoundEffects(context);
    }

    //*********************************************************************************************************************************************************//
    // Game loop and game state methods

    public void updateUI(){
        runnable = new Runnable() {
            @Override
            public void run() {
                updateUI();
            }
        };
        //30 frames per second
        handler.postDelayed(runnable, 1000/10);

        if(!gameOver) {
            //Start waves of enemies if told by wave controller
            if (waveStart) {
                waveStart();
            }
            //End wave if told to by wave controller
            if (waveEnd) {
                waveEnd();
            }

            //Show the day as text and fade away
            float alpha = dayText.getAlpha();
            if (alpha > 0)
                dayText.setAlpha(dayText.getAlpha() - 0.005f / alpha/alpha);
        }

        //Show game over pop up if told by game engine
        if(showGameOver) {
            gameOver();
        }
    }

    //Calculate points scored and level
    void pointsAndLevels(){

    }



    //On game over show dialog box with results and give the player the options of quiting to main menu or trying again
    void gameOver(){
        //Apply only once
        showGameOver = false;
        gameOver = true;

        //Custom alert dialog
        ViewGroup showGameOver = (ViewGroup) getLayoutInflater().inflate(R.layout.game_over,null,false);

        //Handle messages for dialog box
        ((TextView)showGameOver.findViewById(R.id.gameOverText)).setText("THE TOWER HAS FALLEN");
        String plural ="S";
        if(day == 1){
            plural = "";
        }
        if(day > highScore){
            highScore = day;

            //Save high score
            highScoreEdit.putInt("HighScore", highScore);
            highScoreEdit.commit();

            ((TextView)showGameOver.findViewById(R.id.newHighScore)).setText("NEW RECORD \n"+highScore +" DAY" + plural );
        }
        else{
            ((TextView)showGameOver.findViewById(R.id.newHighScore)).setText("YOU SURVIVED FOR "+day+ " DAY" + plural);
        }

        dialogBuilder.setView(showGameOver);
        final AlertDialog dialog = dialogBuilder.create();

        //Dialog box negative button, return to main menu
        showGameOver.findViewById(R.id.mainMenu).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                returnToMenu();
            }
        });

        //Dialog box positive button, start new game
        showGameOver.findViewById(R.id.tryAgain).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //reset states and restart game loop
                day = 0;

                paused = false;
                updateHealth(100);
                gameView.init();

                //Close dialog box
                dialog.dismiss();
            }
        });
        dialog.setCanceledOnTouchOutside(false);
        dialog.show();

        gameOverAnim(day==highScore && day>0);
    }

    //Show day and play rooster sound effect at beginning of wave
    private void waveStart(){
        dayText.setText("DAY " + (day+1));
        dayText.setAlpha(1);
        waveStart = false;

        soundEffects.play(SoundEffects.ROOSTER);
    }

    //Move on to the next day
    private void waveEnd(){
        day++;
        waveEnd = false;
    }

    //*********************************************************************************************************************************************************//
    // On click methods

    void returnToMenu() {
        handler.removeCallbacks(runnable);
        gameView.removeCallbacks(gameView.gameThread);
        Intent i = new Intent(this, GameMenu.class);
        startActivity(i);
    }

    public void returnToMenu(View view) {
        returnToMenu();
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



    //*********************************************************************************************************************************************************//
    // Animations


    //Show points scored, rise up and fade away
    void pointsScoredAnim(int pointsScored, int x, int y){
    }

    void deathAnim(){

    }


    //Shape animation on game over
    void gameOverAnim(boolean hiScore){


    }

    //*********************************************************************************************************************************************************//
    // Accessor / Mutator methods

    public void updateHealth(float health){
        healthBar.setProgress((int)health);

    }


}
