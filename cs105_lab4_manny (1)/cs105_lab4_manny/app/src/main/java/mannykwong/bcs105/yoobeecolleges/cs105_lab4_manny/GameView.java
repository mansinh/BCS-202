package mannykwong.bcs105.yoobeecolleges.cs105_lab4_manny;

import android.app.Activity;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Rect;
import android.util.AttributeSet;
import android.util.DisplayMetrics;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

import java.util.ArrayList;

//-----------------------------------------------------------------------------------------------------------
//Game engine
//Handles logic, physics and graphics
//-----------------------------------------------------------------------------------------------------------

public class GameView extends SurfaceView implements Runnable {
    public static GameView instance;
    int screenWidth, screenHeight;

    final static int FPS = 30;
    final float fixedDeltaTime = (int) (1000 / FPS); // in milliseconds
    float deltaTime = fixedDeltaTime;

    //Physics
    public float groundLevel, gravity = 0.3f;
    int physicsIterations = 5;


    //Projectile
    int projectileIndex = 0;//Next projectile in array to spawn
    float shootSpeedVariance=0.1f, shootDirectionVariance = 10f;//Error in shooting speed and direction

    //Logic
    boolean isRunning = false;
    Thread gameThread;
    WaveController waveController;//Controls when enemies spawn
    int enemyIndex = 0;//Next enemy in array to spawn

    //Game objects
    GameObject ground;
    public Tower tower;
    ArrayList<Projectile> projectiles = new ArrayList<Projectile>();
    ArrayList<AreaEffect> explosions = new ArrayList<AreaEffect>();
    ArrayList<Bomb> enemies = new ArrayList<Bomb>();

    //Drawing
    Bitmap sky;
    SurfaceHolder holder;

    public GameView(Context context) {
        super(context);
        init();
    }

    public GameView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public GameView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    public GameView(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
        init();
    }

    //-----------------------------------------------------------------------------------------------------------
    //Initialization
    //-----------------------------------------------------------------------------------------------------------

    void init(){
        //Singleton
        if(instance == null) {
            instance = this;
        }



        //Dimensions
        DisplayMetrics displayMetrics = new DisplayMetrics();
        ((Activity) getContext()).getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        screenHeight = displayMetrics.heightPixels;
        screenWidth = displayMetrics.widthPixels;
        groundLevel = screenHeight*3/4;

        holder = getHolder();

        //Ground gameobject
        Bitmap groundSprite = BitmapFactory.decodeResource(this.getResources(), R.drawable.ground);
        ground =  new GameObject(groundSprite,0.5f,0.0f);
        ground.setWidth(screenWidth*2);
        ground.setPos(0,groundLevel);

        //Tower gameobject
        Bitmap towerSprite = BitmapFactory.decodeResource(this.getResources(), R.drawable.tower);
        tower = new Tower(towerSprite,0.5f,0.9f, 100);
        tower.setHeight(screenHeight/4);
        tower.setPos(screenWidth/2, groundLevel);
        tower.setDestroyedSound(SoundEffects.DEATH);
        Game.instance.updateHealth(tower.health);

        //Projectile gameobjects
        projectileIndex = 0;//Reset first projectile shot to be the first in the pool
        projectiles.clear();//Clear the projectile pool and repopulate
        Bitmap projSprite = BitmapFactory.decodeResource(this.getResources(), R.drawable.projectile);
        for(int i =0; i<20;i++) {
            Projectile proj = new Projectile(projSprite, 1f, 0.5f);
            proj.setWidth(30+(int)(Math.random()*30));//Randomy vary size of projectiles
            proj.radius = 5;
            proj.setDamage(12);
            proj.setPush(1,4);//Momentum of projectile

            //Shot projectile returns to projectile pool when cool down is over
            proj.setCoolDown(50000,(int)deltaTime);

            projectiles.add(proj);
        }

        //Enemy and explosion game objects
        enemyIndex = 0;//Reset next spawned enemy to first in the pool
        //Clear the explosion and enemy pool and repopulate
        explosions.clear();
        enemies.clear();
        Bitmap enemySprite =  BitmapFactory.decodeResource(this.getResources(), R.drawable.grenade);
        Bitmap explosionSprite = BitmapFactory.decodeResource(this.getResources(), R.drawable.explosion);
        for(int i =0; i<20;i++) {
            AreaEffect explosion = new AreaEffect(explosionSprite,0.5f,1f);
            explosions.add(explosion);
            explosion.setTriggerSound(SoundEffects.EXPLOSION);

            Bomb enemy = new Bomb(enemySprite, 0.5f, 1f,explosion);
            enemy.setTarget(tower);
            enemy.setWidth(200);
            enemy.setCircleCollider(70);
            //enemy.setVelocity(-(float) screenWidth/12000,0);
            enemy.maxHealth=500;
            enemy.simulated = false;
            enemy.visible = false;
            enemy.setDamagedSound(SoundEffects.DAMAGE);

            enemies.add(enemy);
            enemy.setPos(screenWidth,groundLevel-100);
        }

        //Background sprites for day-night cycle
        sky = BitmapFactory.decodeResource(this.getResources(),R.drawable.cloudy_sky);
        Bitmap skySprite = BitmapFactory.decodeResource(this.getResources(),R.drawable.sky);

        //Controller for spawning waves of enemies
        waveController = new WaveController(skySprite,0,0);
        waveController.setWidth(screenWidth);

        //Tells game controller that the game is ready to start
        Game.instance.gameOver = false;
    }

    //-----------------------------------------------------------------------------------------------------------
    //Game loop
    //-----------------------------------------------------------------------------------------------------------

    public void resume() {
        isRunning = true;
        gameThread = new Thread(this);
        gameThread.start();
    }

    public void pause() {
        isRunning = false;
        boolean retry = true;
        while (retry) {
            try {
                gameThread.join();
                retry = false;
            } catch (Exception e) {
                gameThread.stop();
            }
        }
    }

    public void run() {
        while (isRunning) {
            if (!holder.getSurface().isValid()) {
                continue;
            }
            long started = System.currentTimeMillis();

            //Apply physics calculations per frame
            for (int i = 0; i < physicsIterations; i++) {
                physics();
            }

            //Apply ame logic to game objects
            update();

            //Draw graphics to surface view
            draw();

            //If the time between frames does not match the target FPS, delay or skip to match
            deltaTime = (System.currentTimeMillis() - started);
            int lag = (int) (fixedDeltaTime - deltaTime);
            if (lag > 0) {
                try {
                    gameThread.sleep(lag);
                } catch (Exception e) {
                }
            }
            while (lag < 0) {
                lag += fixedDeltaTime;
            }
        }
    }

    //-----------------------------------------------------------------------------------------------------------
    //Graphics
    //-----------------------------------------------------------------------------------------------------------

    private void draw() {
        Canvas canvas = holder.lockCanvas(null);
        if (canvas != null) {
            canvas.drawBitmap(sky,new Rect(0,0,sky.getWidth(),sky.getHeight()),new Rect(0,0,screenWidth,screenHeight),null);

            //Draw sky/game background
            waveController.draw(canvas);

            //Draw tower (player)
            tower.draw(canvas);

            //Draw projectiles
            for (int i = 0; i < projectiles.size(); i++) {
                projectiles.get(i).draw(canvas);
            }

            //Draw enemies
            for (int i = 0; i < enemies.size(); i++) {
                enemies.get(i).draw(canvas);
            }

            //Draw explosions
            for (int i = 0; i < explosions.size(); i++) {
                explosions.get(i).draw(canvas);
            }

            //Draw foreground
            ground.draw(canvas);

            holder.unlockCanvasAndPost(canvas);
        }
    }

    //-----------------------------------------------------------------------------------------------------------
    //Physics
    //-----------------------------------------------------------------------------------------------------------
    private void physics() {
        //Projectile motion and collisions
        for (int i = 0; i < projectiles.size(); i++) {
            GameObject p = projectiles.get(i);
            //If projectile is shot, check collision with all enemies
            if(p.visible&&p.simulated) {
                for(int j = 0; j < enemies.size();j++){
                    if(enemies.get(j).visible) {
                        p.collision(enemies.get(j));
                    }
                }
                if(p.gravity) {
                    gravity(p);
                }
            }
            //Projectile motion
            p.physics(deltaTime/physicsIterations);
        }

        //Enemy motion and gravity
        for(int i = 0; i < enemies.size();i++){
            Bomb enemy = enemies.get(i);
            enemy.physics(deltaTime/physicsIterations);
            if(enemy.gravity){
                gravity(enemy);
            }
        }

        //Check collisions between explosions and other destroyable game objects (tower/enemies)
        for(int i = 0; i < explosions.size();i++){
            AreaEffect explosion = explosions.get(i);
            if(explosion.visible && !explosion.effectApplied){
                for(int j = 0; j < enemies.size();j++) {
                    Bomb enemy = enemies.get(j);
                    if(enemy.visible) {
                        explosion.collision(enemy);
                    }
                }
                if(tower.visible){
                    if (explosion.collision(tower)) {
                        //Update UI health bar
                       Game.instance.updateHealth(tower.health/tower.maxHealth*100);
                    }
                }
                //Apply explosion only once per trigger
                explosion.effectApplied = true;
            }
        }
    }

    //If gameobject is above ground level, apply gravity
    public void gravity(GameObject g) {
        if (g.position.y  < groundLevel) {
            g.setVelocity(g.getVelocity().x, g.getVelocity().y + gravity * fixedDeltaTime / 1000 / physicsIterations);
        } else {
            g.onGrounded(groundLevel);
        }
    }

    //-----------------------------------------------------------------------------------------------------------
    //Game logic
    //-----------------------------------------------------------------------------------------------------------
    private void update() {

        //If the enemy pool is populated, spawn waves of enemies
        if(enemies.size() > 0) {
            waveController.update(deltaTime);
        }

        //If the target (tower) is still standing, move towards it
        for(int i = 0; i < enemies.size();i++){
            Bomb enemy = enemies.get(i);
            if(enemy.visible) {
                enemy.update(deltaTime);
                if(!tower.destroyed){
                    if(enemy.collision(tower)){
                        enemy.onDestroyed();
                    }
                }
                else {
                    //If the target (tower) is destroyed, move around aimlessly
                    enemy.setTarget(null);
                    enemy.moveSpeed=(enemy.moveSpeed+(float) Math.sin(i*enemy.time/10000)/enemy.radius)/2;
                }
            }
        }

        //If the tower is destroyed, tell the game controller to show game over alert dialog
        if(!tower.visible){
            if(!Game.instance.gameOver) {
                Game.instance.showGameOver = true;
            }
        }
    }

    //Spawn enemy into the game space when instructed to by the wave controller
    void spawn(float waveIntensity){
        //Cycle through enemy pool and spawn next available enemy
        if(enemyIndex == enemies.size()){
            enemyIndex = 0;
        }
        Bomb enemy = enemies.get(enemyIndex);
        if(!enemy.visible){
            //Wave intensity is the probability of an enemy spawning per frame
            if(Math.random()<waveIntensity) {
                //Initialize enemy attributes
                float size = 0;
                float moveSpeed = 0;
                int maxHealth = 0;

                //Randomly picks the side of the tower the enmy spawns at
                float direction = (float)(Math.random()-0.5);
                if(direction>0){
                    direction = 1;
                }
                else {
                    direction = -1;
                }

                float positionX = screenWidth/2 - direction*(tower.width/2 + (float)Math.random()*screenWidth/2);

                //Randomly choose enemy type to spawn
                int seed = (int)(Math.random()*100);

                //40% chance of spawning a small agile enemy with low max health
                if(seed < 40) {

                    size = 25+(float)Math.random()*10;
                    moveSpeed = direction*(float)screenWidth / 15000 * 2;
                    maxHealth = 20;
                }
                //55% chance of spawning a medium size enemy
                else if(seed < 95) {

                    size = 50 + (float) Math.random() * 50;
                    moveSpeed = direction*(float) screenWidth / 15000;
                    maxHealth = 100;
                }
                //5% chance of spawning a slow large enemy with high max health
                else {

                    size = 150+(float)Math.random()*15;
                    moveSpeed = direction*(float)screenWidth/15000/2;
                    maxHealth = 400;
                }

                enemy.spawn(positionX, -size,size,moveSpeed,maxHealth);
            }
        }
        enemyIndex++;
    }

    //Shoot projectile
    public void shoot(float x, float y){
        if(!tower.destroyed){
            Projectile proj = projectiles.get(projectileIndex);
            if(true||!proj.visible) {
                //remove projectile from attached parent object
                proj.removeParent();

                //Set position shot from to the top of the tower
                float x0 = tower.getPos().x;
                float y0 = tower.getPos().y -  0.8f * tower.height;



                //Shoot direction from top of the tower to the position of the screen tapped
                Vector2 shootDir = new Vector2(x - x0, y-y0);

                //Add random variation to shot speed and direction
                float shootSpeed = 1.5f + (float) (Math.random() - 0.5f) * shootSpeedVariance;
                shootDir = Vector2.rotate(shootDir,(float)(Math.random()-0.5f)*shootDirectionVariance);

                shootDir=shootDir.getNormal();
                proj.setPos(x0 + shootDir.x*proj.width*2, y0+shootDir.y*proj.width*2);
                proj.shoot(shootSpeed, shootDir);
            }

            //Cycle to next projectile in pool
            projectileIndex++;
            if(projectileIndex == projectiles.size()){
                projectileIndex = 0;
            }
        }
    }
}




