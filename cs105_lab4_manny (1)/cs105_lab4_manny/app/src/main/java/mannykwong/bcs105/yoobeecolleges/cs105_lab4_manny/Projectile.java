package mannykwong.bcs105.yoobeecolleges.cs105_lab4_manny;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;

public class Projectile extends GameObject {
    int damage;
    float pushX, pushY;
    float coolDown; //This determines when the projectile returns to the pool after being shot
    float timeSinceShot; //When this is larger than the coolDown the projectile returns to pool


    public Projectile(Bitmap sprite, float offsetX, float offsetY) {
        super(sprite, offsetX, offsetY);
        bounce = 0;
        init();

    }

    @Override
    public void draw(Canvas canvas) {
        super.draw(canvas);

        //If attached parent is destroyed, remove from parent
        if(parent!=null) {
            if (!parent.visible) {
                parent = null;
                visible = false;
            }
        }

        //If shot, count the time since shot. Start fading away just before cool down ends and return to pool
        if(visible) {
            if (timeSinceShot > coolDown*0.75) {


                int alpha = (int) ((coolDown-timeSinceShot)/(coolDown/4)*255);
                paint.setAlpha(alpha);
                if (timeSinceShot > coolDown) {
                    init();
                }
            }

        }

    }

    @Override
    public void physics(float deltaTime) {
        super.physics(deltaTime);
        timeSinceShot+=deltaTime;
    }

    public void shoot(float s, float dx, float dy){
        init();
        speed = s;
        timeSinceShot = 0;
        setDir(dx,dy);
        rotation = (float) Math.toDegrees(Math.atan2(direction.y, direction.x));
        gravity = true;
        simulated = true;
        visible = true;
        //Game.instance.soundEffects.play(Game.instance.soundEffects.PEW);
    }

    public void shoot(float s, Vector2 d){
        shoot(s,d.x,d.y);
    }

    void init(){
        centerPivot = false;
        facing = true;
        simulated=false;
        visible=false;
        paint.setAlpha(255);
        parent = null;

    }

    protected void onCollision(GameObject other) {
        try{
            //Stop on collision
            speed = 0;
            gravity = false;
            simulated = false;

            //Attach to the game object
            setParent(other);

            //Apply momentum and health effect (damage) to object if it is destroyable
            ((Destroyable)other).onDamage(damage, direction.x*pushX, direction.y*pushY);
        }
        catch (Exception e){
            e.printStackTrace();
        }

    }

    //Stop if the projectile hits the ground
    @Override
    protected void onGrounded(float level) {
        //super.onGrounded(level);
        if(speed > 0.1){
            //Game.instance.soundEffects.play(SoundEffects.HIT);
        }
        speed = 0;
    }

    //Set the momentum of the shot to transfer to the game object the projectile hits
    public void setPush(float x, float y){
        pushX = x;
        pushY = y;
    }
    public void setDamage(int dmg){
        damage =dmg;
    }

    public void setCoolDown(float milliseconds, float deltaTime){
        coolDown = milliseconds/deltaTime;
    }

}
