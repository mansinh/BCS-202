package mannykwong.bcs105.yoobeecolleges.cs105_lab4_manny;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorFilter;
import android.graphics.LightingColorFilter;

public class Bomb extends Destroyable {
    AreaEffect explosion; // Area affect on destruction
    float stun = 0; // Stun time after impact with the ground
    float moveSpeed;
    int time = 0;

    GameObject target; //Target to move towards


    public Bomb(Bitmap sprite, float offsetX, float offsetY, AreaEffect explosion) {
        super(sprite, offsetX, offsetY);
        this.explosion = explosion;
        gravity = true;
    }

    @Override
    public void onDestroyed(){
        explosion.onTrigger(position);
       super.onDestroyed();

    }

    @Override
    protected void destroyAnim(Canvas canvas){
        visible = false;

    }

    public void setTarget(GameObject target){
        this.target = target;
    }

    //Intitialize states and attributes on spawning
    public void spawn(float x, float y, float size, float moveSpeed, int maxHealth) {
        setPos(x,y);
        setWidth(size);
        this.moveSpeed = moveSpeed;
        this.maxHealth = maxHealth;
        health = maxHealth;

        //Physics
        setCircleCollider(size/2*0.5f);
        speed = 0;
        rotation = 0;
        direction = new Vector2(0,0);
        time = 0;

        //Visuals
        paint.setAlpha(255);
        ColorFilter colorFilter = new LightingColorFilter(Color.WHITE,0);
        paint.setColorFilter(colorFilter);

        //States
        destroyed = false;
        centerPivot = true;
        simulated = true;
        visible = true;

        //Explosion attributes
        explosion.setWidth(size*1.6f);
        explosion.radius = size*0.8f;
        explosion.forceAdd = radius/2;
        explosion.angularVelocityAdd = 10f;
        explosion.effect=maxHealth/8;
        angularVelocity = (float)(Math.random()-0.5f)/2;
        explosion.visible = false;
    }

    @Override
    public void update(float deltaTime){

        if(grounded()) {
            //Apply friction when on the ground
            speed*=0.9f;
            angularVelocity = angularVelocity/2;

            //When not spinning and not in the air
            if(rotation < 2 || rotation>358) {
                rotation = 0;

                //Move towards target if it exists
                if(target!=null) {
                    moveSpeed = Math.signum(target.position.sub(position).x) * Math.abs(moveSpeed);
                }
                position = position.add(new Vector2(moveSpeed * deltaTime,0));

                //Bob up and down while moving in proportion to speed and size
                drawDisplacement.y = (float) Math.abs(Math.cos(2*(moveSpeed) * time / 10)) * radius / 10;

                //Flip sprite to the right if moving right
                if(moveSpeed > 0){
                    flipX();
                }
                else{
                    //Flip sprite back if moving left.
                    scaleX = Math.abs(scaleX);
                }

            }
            else {
                //Get back up after being stunned for an amount of time
                if(stun > 0) {
                    stun -=deltaTime;

                }
                else {
                    if(rotation>180){
                        rotation=(rotation+360)/2;
                    }
                    else {
                        rotation = rotation / 2;
                    }
                }
            }

        }
        else {
            //Apply stun on impact with the ground
            stun = 1000;
        }

        time+=deltaTime;
    }
    boolean grounded(){
        return Math.abs(position.y - GameView.instance.groundLevel) < 1;
    }

}
