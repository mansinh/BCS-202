package mannykwong.bcs105.yoobeecolleges.cs105_lab4_manny;

import android.graphics.Bitmap;
import android.graphics.Canvas;

import java.sql.SQLOutput;

public class AreaEffect extends GameObject{

    int effect; //Effect on the health on Destroyables inside area
    boolean effectApplied;

    int sound;

    //Physics
    float forceAdd, angularVelocityAdd;



    public AreaEffect(Bitmap sprite, float offsetX, float offsetY) {
        super(sprite, offsetX, offsetY);
        visible = false;

    }

    //Show effect on screen and play sound effect when triggered
    public void onTrigger(Vector2 p){
        position = p;
        paint.setAlpha(255);
        visible = true;
        effectApplied = false;
        Game.instance.soundEffects.play(sound,(radius/500)/2,SoundEffects.MAXSTREAMS, 300f/radius);
    }

    @Override
    public void draw(Canvas canvas) {
        super.draw(canvas);

        //AExploding animation
        if(visible) {
            //Fade
            int alpha = paint.getAlpha() - (int)(2f/(radius/500));
            if (alpha > 0) {
                paint.setAlpha(alpha);
            } else {
                visible = false;

            }
            //Shake
            drawDisplacement.y = height * ((float) Math.random() - 0.5f) / 50;
            drawDisplacement.x = width * ((float) Math.random() - 0.5f) / 50;

            //Expand
            setWidth(width+radius/20);
        }
    }

    @Override
    protected void onCollision(GameObject other) {

        //Apply effect on collided Destroyables
        try {
            ((Destroyable)other).onDamage(effect,0,0);
        }
        catch (Exception e){
            e.printStackTrace();
        }

        //Physics

        Vector2 dir = (other.position.sub(position)).getNormal();

        //Apply spin
        if(Math.abs(angularVelocityAdd)>0 && other.simulated&&other.radius>0){

            other.angularVelocity += (float)Math.signum(dir.x)*angularVelocityAdd/other.radius;
        }

        //Launch into the air
        if (Math.abs(forceAdd)>0 && other.simulated&&other.radius>0){
            dir = dir.add(new Vector2(0,(float)Math.random()*2));
            other.setVelocity(dir.multiply(forceAdd/other.radius));
        }

    }

    public void setTriggerSound(int sound){
        this.sound = sound;
    }
}
