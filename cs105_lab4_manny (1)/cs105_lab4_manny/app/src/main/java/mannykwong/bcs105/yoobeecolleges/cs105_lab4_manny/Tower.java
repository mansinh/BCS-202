package mannykwong.bcs105.yoobeecolleges.cs105_lab4_manny;

import android.graphics.Bitmap;
import android.graphics.Canvas;

public class Tower extends Destroyable {
    public Tower(Bitmap sprite, float offsetX, float offsetY, int maxHealth) {
        super(sprite, offsetX, offsetY);

        //Initialization
        visible = true;
        simulated = false;
        gravity = false;
        this.maxHealth = maxHealth;
        health = maxHealth;
    }

    //Extra collision check, hit box smaller than sprite
    @Override
    protected boolean collisionCheck(GameObject other) {
        return Math.abs(other.position.x-position.x) < other.radius;
    }

    //Animation on health bar depleted
    @Override
    protected void destroyAnim(Canvas canvas) {
        if(visible) {
            //Fading animation
            int alpha = paint.getAlpha() - 2;
            if (alpha > 0) {
                paint.setAlpha(alpha);
            } else {
                visible = false;
            }

            //Shaking animation
            drawDisplacement.y = height * ((float) Math.random() - 0.5f) / 50;
            drawDisplacement.x = width * ((float) Math.random() - 0.5f) / 20;

            //Sinking animation
            position = position.add(new Vector2(0,GameView.instance.deltaTime/50));
        }
    }
}
