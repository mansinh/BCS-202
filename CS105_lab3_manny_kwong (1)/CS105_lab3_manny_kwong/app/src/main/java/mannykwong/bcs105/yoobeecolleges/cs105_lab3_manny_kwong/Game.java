package mannykwong.bcs105.yoobeecolleges.cs105_lab3_manny_kwong;
import android.animation.ObjectAnimator;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.os.Handler;
import android.speech.tts.TextToSpeech;
import android.util.DisplayMetrics;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import org.w3c.dom.Text;

import java.util.ArrayList;
import java.util.Locale;

//Game activity and loop class
public class Game extends AppCompatActivity{
    //views
    String[] shapeNamePool;
    Button[] buttons;
    Button musicButton;
    TextView scoreText, levelText, highScoreText, points;
    ImageView shapeImage, pop, crash, gameOverShape;

    //state variables
    boolean paused = false, gameOver = false;

    int[] shapeIDPool, shapeColors;
    int shapeIndex, correctButtonIndex;;
    int screenHeight, screenWidth;
    int level = 0, score, movePeriod = 1000, highScore;

    //misc
    MediaPlayer popPlayer;
    AlertDialog.Builder dialogBuilder;
    TextToSpeech speech;
    SharedPreferences.Editor highScoreEdit;

    //Threads
    Handler handler;
    Runnable runnable;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        DisplayMetrics displayMetrics = new DisplayMetrics();
        getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        screenHeight = displayMetrics.heightPixels;
        screenWidth = displayMetrics.widthPixels;
        setContentView(R.layout.activity_game);


        //initialize
        initShapes();
        initUI();
        initEffects();
        initMusic();

        //start game loop
        handler = new Handler();
        update();
    }

    //*********************************************************************************************************************************************************//
    // Initialization Methods

    void initShapes(){
        shapeImage = findViewById(R.id.shapeImage);
        int circle = R.drawable.circle;
        int diamond = R.drawable.diamond;
        int heart = R.drawable.heart;
        int oval = R.drawable.oval;
        int pentagon = R.drawable.pentagon;
        int rectangle = R.drawable.rectangle;
        int star = R.drawable.star;
        int triangle = R.drawable.triangle;

        shapeIDPool = new int[]{circle, diamond, heart, oval, pentagon, rectangle, star, triangle};
        shapeNamePool = new String[]{"CIRCLE", "DIAMOND", "HEART", "OVAL", "PENTAGON", "RECTANGLE", "STAR", "TRIANGLE"};
        shapeColors = new int[]{R.color.colorBlue,R.color.colorGreen,R.color.colorMagenta,R.color.colorOrange,R.color.colorPurple,R.color.colorYellow};

        shapeImage.setY(-200);
    }

    void initUI(){
        //Answering buttons
        Button button0 = findViewById(R.id.button0);
        Button button1 = findViewById(R.id.button1);
        Button button2 = findViewById(R.id.button2);
        Button button3 = findViewById(R.id.button3);
        buttons = new Button[]{button0, button1, button2, button3};

        //Score bar
        scoreText = findViewById(R.id.score);
        levelText = findViewById(R.id.level);
        highScoreText = findViewById(R.id.highScore);

        //Load high score
        SharedPreferences pref = getSharedPreferences("HighScore", Context.MODE_PRIVATE);
        highScoreEdit = pref.edit();
        highScore = pref.getInt("HighScore",0);
        highScoreText.setText(highScore+"");


        //Game over dialog box
        dialogBuilder = new AlertDialog.Builder(this,R.style.MyAlertDialog);
        speech = new TextToSpeech(this, new TextToSpeech.OnInitListener(){
            @Override
            public void onInit(int status) {
                speech.setLanguage(Locale.UK);

            }
        });
        speech.speak("",TextToSpeech.QUEUE_FLUSH, null);
    }

    void initEffects(){
        pop = findViewById(R.id.pop);
        crash = findViewById(R.id.crash);
        points = findViewById(R.id.points);

        pop.setAlpha(0f);
        crash.setAlpha(0f);
        points.setAlpha(0f);
    }

    void initMusic(){
        musicButton = findViewById(R.id.musicButton);
        popPlayer = MediaPlayer.create(this,R.raw.pop_sound);
        popPlayer.setVolume(1f,1f);

        //If music is muted or playing from last activity with the button
        if(Music.isPlaying) {
            musicButton.setBackground(getResources().getDrawable(R.drawable.sound_on));
        }
        else{
            musicButton.setBackground(getResources().getDrawable(R.drawable.sound_off));
        }
    }

    //*********************************************************************************************************************************************************//
    // Game loop and game state methods

    public void update(){
        runnable = new Runnable() {
            @Override
            public void run() {
                update();
            }
        };
        //30 frames per second
        handler.postDelayed(runnable, 1000/30);

        //Run game if not game over or paused
        if(!gameOver) {
            if (!paused) {
                if (level == 0) {
                    //On starting game
                    pointsAndLevels();
                    nextShape();
                }

                //Game over if the shape falls off the screen
                if (shapeImage.getY() > screenHeight) {
                    gameOver();
                }
            }
        }
    }

    //Calculate points scored and level
    void pointsAndLevels(){
        int pointsScored = 0;
        if(level == 0){
            level = 1;
        }
        else {
            //Points proportional to how high up the shape was on answering/ how quickly answered correctly
            pointsScored = (int)((screenHeight - shapeImage.getY())/screenHeight * 200*shapeImage.getScaleX());
            score += pointsScored;

            //Increase level per 1000 points
            level = (int)(score/1000)+1;

            //Play scoring animation
            pointsScoredAnim(pointsScored);

        }

        //Apply new score and level to text views
        scoreText.setText("SCORE  " + score);
        levelText.setText("LEVEL  " + level);
    }


    //Set up the next shape image with a random shape, falling position, rotation and speed
    void nextShape(){
        //Choose a random shape
        shapeIndex = (int) (Math.random() * shapeIDPool.length);
        shapeImage.setImageDrawable( getResources().getDrawable( shapeIDPool[shapeIndex]));

        //Set correct name set to random button
        correctButtonIndex = (int) (Math.random() * 4);
        ArrayList<String> names = new ArrayList<String>();
        for(int i = 0; i < shapeNamePool.length;i++){
            names.add(shapeNamePool[i]);
        }
        buttons[correctButtonIndex].setText(shapeNamePool[shapeIndex]);
        names.remove(shapeNamePool[shapeIndex]);

        //Fill remaining buttons with random names
        for(int i = 0; i < 4; i++){
            if(i != correctButtonIndex){
                int randomIndex = (int)(names.size()*Math.random());
                buttons[i].setText(names.get(randomIndex));
                names.remove(randomIndex);
            }
        }

        //Choose a starting position for new shape beyond the top of the screen
        shapeImage.setY(-200);
        System.out.println(level + " " + screenWidth + " " + screenHeight);

        if(level > 3) {
            //Starting x position anywhere along width of the screen when level > 3
            shapeImage.setX(screenWidth / 2 + screenWidth * ((float) Math.random() - 0.5f) - shapeImage.getWidth() / 2);
        }
        else if(level > 1) {
            //Starting x position anywhere along half of the screen around the middle when level > 1
            shapeImage.setX(screenWidth / 2 + screenWidth * ((float) Math.random() - 0.5f)/2 - shapeImage.getWidth() / 2);
        }


        System.out.println(shapeImage.getX());

        //Random shape size
        float scale = (float)Math.random()*0.75f +0.5f;
        shapeImage.setScaleX(scale);
        shapeImage.setScaleY(scale);

        //Random shape rotation
        shapeImage.setRotation((int) (Math.random() - 0.5f) * 30);


        //Random shape colour
        shapeImage.setColorFilter(getResources().getColor(shapeColors[(int)(shapeColors.length*Math.random())]));

        //Drop shape from top of the screen
        fallingShapeAnim();
    }


    //On game over show dialog box with results and give the player the options of quiting to main menu or trying again
    void gameOver(){
        gameOver = true;

        //Show shape crashing outside screen
        crashAnim();

        //Reset the shape image
        shapeImage.animate().translationY(shapeImage.getY()).setDuration(0);
        shapeImage.animate().rotation(shapeImage.getRotation()).setDuration(movePeriod);

        //Inflate custom dialog box on game over
        ViewGroup showGameOver = (ViewGroup) getLayoutInflater().inflate(R.layout.game_over,null,false);

        //Handle messages for dialog box
        String[] gameOverWords = new String[]{"BETTER LUCK NEXT TIME!","KEEP TRYING!","GOOD TRY!"};
        if(score > highScore){
            //Positive result
            speech.speak("Well Done!  New High Score!",TextToSpeech.QUEUE_FLUSH, null);
            highScore = score;

            //Save high score
            highScoreEdit.putInt("HighScore", highScore);
            highScoreEdit.commit();

            ((TextView)showGameOver.findViewById(R.id.newHighScore)).setText("NEW HIGH SCORE! \n"+highScore );
        }
        else{
            //Negative result, random word of encouragement
            int i = (int)(Math.random()*gameOverWords.length);
            speech.speak(gameOverWords[i],TextToSpeech.QUEUE_FLUSH, null);
            ((TextView)showGameOver.findViewById(R.id.newHighScore)).setText(gameOverWords[i]);
        }

        //Name of shape the player lost on
        ((TextView)showGameOver.findViewById(R.id.gameOverText)).setText(shapeNamePool[shapeIndex]);


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
                //reset states
                level = 0;
                score = 0;
                highScoreText.setText("" + highScore);
                paused = false;
                gameOver = false;

                //Close dialog box
                dialog.dismiss();
            }
        });
        dialog.setCanceledOnTouchOutside(false);
        dialog.show();

        //Show the shape the player lost on and animate
        gameOverShape = showGameOver.findViewById(R.id.gameOverImage);
        gameOverShape.setImageDrawable(shapeImage.getDrawable());
        gameOverShape.setColorFilter(shapeImage.getColorFilter());

        gameOverAnim(score==highScore && score>0);
    }

    //*********************************************************************************************************************************************************//
    // On click methods

    void returnToMenu() {
        handler.removeCallbacks(runnable);
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

    public void answer(View view){
        //if answered correctly
        if(view.equals(buttons[correctButtonIndex])&&!paused) {

            //Player feedback animation
            popAnim();

            //Calculate points
            pointsAndLevels();

            //Set up next shape
            nextShape();
        }
    }

    //*********************************************************************************************************************************************************//
    // Animations

    //Popping effect on answering correctly
    void popAnim(){
        //Play poppng sound
        popPlayer.start();

        pop.setAlpha(1f);
        pop.setRotation(shapeImage.getRotation());
        pop.setY(shapeImage.getY());
        pop.setX(shapeImage.getX());
        pop.setScaleX(shapeImage.getScaleX());
        pop.setScaleY(shapeImage.getScaleY());
        pop.setColorFilter(shapeImage.getColorFilter());
        pop.animate().alpha(0).setDuration(500);
    }

    //Show points scored, rise up and fade away
    void pointsScoredAnim(int pointsScored){
        points.setText("+"+pointsScored + " ");
        points.setX(pop.getX());
        points.setY(pop.getY());
        points.setScaleX(pop.getScaleX());
        points.setScaleY(pop.getScaleY());
        points.setAlpha(1f);
        points.animate().translationYBy(-screenHeight/8);
        points.animate().alpha(0).setDuration(1000);
    }

    void crashAnim(){
        crash.setAlpha(1f);
        crash.setX(shapeImage.getX());
        crash.setColorFilter(shapeImage.getColorFilter());
        crash.animate().alpha(0).setDuration(1000);;
    }


    //Shape animation on game over
    void gameOverAnim(boolean hiScore){

        if(gameOverShape != null){
            float dispY = shapeImage.getHeight() * 0.1f;
            ObjectAnimator jump = ObjectAnimator.ofFloat(gameOverShape, "translationY", 0, dispY, dispY, 0, -100, -110, -115, -110, -100, 0, dispY, dispY, 0);
            ObjectAnimator squashX = ObjectAnimator.ofFloat(gameOverShape, "scaleX", 1, 1.1f, 1.1f, 0.8f, 1, 1, 1, 1.2f, 1);
            ObjectAnimator squashY = ObjectAnimator.ofFloat(gameOverShape, "scaleY", 1, 0.9f, 0.9f, 1f, 1, 1, 1, 0.8f, 1);


            if(hiScore){
                //Jump higher and do a flip if acheived new high score

                jump = ObjectAnimator.ofFloat(gameOverShape, "translationY", 0, dispY, dispY, 0, -200, -210, -215, -210, -200, 0, dispY, dispY, 0);
                squashX = ObjectAnimator.ofFloat(gameOverShape, "scaleX", 1, 1.1f, 1.1f, 0.8f, 1, 1, 1, 1.2f, 1);
                squashY = ObjectAnimator.ofFloat(gameOverShape, "scaleY", 1, 0.9f, 0.9f, 1f, 1, 1, 1, 0.8f, 1);
                ObjectAnimator flip = ObjectAnimator.ofFloat(gameOverShape,"rotation",0,0,0,0,180,360,360,360,360);
                flip.setDuration(2000);
                flip.start();
            }
            else{
                //Normal jump

                jump = ObjectAnimator.ofFloat(gameOverShape, "translationY", 0, dispY, dispY, 0, -100, -110, -115, -110, -100, 0, dispY, dispY, 0);
                squashX = ObjectAnimator.ofFloat(gameOverShape, "scaleX", 1, 1.1f, 1.1f, 0.8f, 1, 1, 1, 1.2f, 1);
                squashY = ObjectAnimator.ofFloat(gameOverShape, "scaleY", 1, 0.9f, 0.9f, 1f, 1, 1, 1, 0.8f, 1);

            }

            jump.setDuration(2000);
            squashX.setDuration(2000);
            squashY.setDuration(2000);
            squashX.start();
            squashY.start();
            jump.start();
        }
    }

    void fallingShapeAnim(){
        //Falling speed proportional to level
        movePeriod = Math.max(15 - level,5)*1000;

        shapeImage.animate().translationY(screenHeight*2).setDuration(movePeriod);
        //Random rotation speed
        int rotate = (int)((Math.random()-0.5f)*600);
        rotate += Math.signum(rotate)*30;
        shapeImage.animate().rotationBy(rotate).setDuration(movePeriod);
    }
}
