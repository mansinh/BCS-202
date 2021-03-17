package mannykwong.bcs105.yoobeecolleges.cs105_lab4_manny;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.RectF;

public class GameObject {
    public float width, height, scaleX = 1, scaleY = 1;

    //Physics
    protected Vector2 position, direction, velocity, offset;
    public float speed, angularVelocity, rotation, localRotation,  bounce = 0.3f, friction = 0.95f;
    RectF srcRect;
    float radius = 0;
    float dt = 0;
    public boolean visible = true, simulated = false, facing = false, gravity = false, centerPivot = true;

    //The parent game object this is attached to if any
    GameObject parent = null;
    Vector2 localPosition;

    //Visuals
    private Bitmap sprite;
    public Paint paint;
    Vector2 drawDisplacement;


    public GameObject(Bitmap sprite, float offsetX, float offsetY){
        //Init visuals
        offset = new Vector2(offsetX,offsetY);//Bitmap offset from position
        width = sprite.getWidth();
        height = sprite.getHeight();
        setSprite(sprite);
        paint = new Paint();
        drawDisplacement = new Vector2(0,0);

        //Init physics
        position = new Vector2(0,0);
        direction = new Vector2(0,0);
        velocity = new Vector2(0,0);
        speed = 0;
        if(GameView.instance != null){
            dt = GameView.instance.fixedDeltaTime;
        }
    }

    //-----------------------------------------------------------------------------------------------------------
    //Visuals
    //-----------------------------------------------------------------------------------------------------------

    public void draw(Canvas canvas){

        if(visible) {
            if (sprite != null) {
                //Rotate sprite around pivot
                float r = rotation;
                Vector2 pivot = position;
                if(centerPivot) {
                    pivot = getCenter();
                }

                //Handle transformations if attached to a parent gameobject
                if(parent!= null){
                    //Rotate sprite around pivot relative to parent
                    r = localRotation+parent.rotation;
                    Vector2 p = Vector2.rotate(localPosition, parent.rotation);

                    //Displace from pivot relative to parent
                    if(parent.centerPivot){
                        position = parent.getCenter().add(p);
                    }
                    else {
                        position = parent.getPos().add(p).add(parent.drawDisplacement);
                    }

                }

                //Drawing transformation matices
                Matrix matrix = new Matrix();
                matrix.setRectToRect(srcRect, getBounds(), Matrix.ScaleToFit.CENTER);
                matrix.postScale(scaleX,scaleY,pivot.x,pivot.y);
                matrix.postRotate(r,pivot.x,pivot.y);

                canvas.drawBitmap(sprite, matrix, paint);
            }
        }
    }

    //Sprite flipping
    public void flipX(){
        scaleX = -Math.abs(scaleX);
    }
    public void flipY(){
        scaleY = -Math.abs(scaleY);
    }

    //-----------------------------------------------------------------------------------------------------------
    //Physics
    //-----------------------------------------------------------------------------------------------------------

    //Apply physics if simulated
    public void physics(float deltaTime){
        //Keep rotations in range of 0-360 degrees
        while (rotation>360){
            rotation-=360;
        }
        while(rotation<0){
            rotation+=360;
        }

        //If not attached to parent apply movement due to physics
        if(parent==null) {
            //Turn towards the direcion of movement
            if(facing) {
                rotation = (float) Math.toDegrees(Math.atan2(direction.y, direction.x));
            }
            if(simulated) {
                position = new Vector2(position.x + direction.x * speed * deltaTime,
                        position.y + direction.y * speed * deltaTime);
                rotation += angularVelocity*deltaTime;
            }
        }
    }

    public boolean collision(GameObject other){

        boolean collided = false;
        if(other.getBounds().intersect(getBounds())) {
            collided = other.collisionCheck(this);
            if (collided) {
                onCollision(other);
            }
        }
        return collided;
    }

    protected boolean collisionCheck(GameObject other){
        return true;
    }

    protected void onCollision(GameObject other){

    }

    protected  void onGrounded(float level){
        //if(speed > 0.1){

        //Game.instance.soundEffects.play(SoundEffects.HIT);
        //}
        setVelocity(speed*direction.x*friction,-speed*direction.y*bounce);
        position.y = level;
    }
    //-----------------------------------------------------------------------------------------------------------
    //Game logic
    //-----------------------------------------------------------------------------------------------------------

    //Non physics movement
    public void move(float deltaTime, float speedX, float speedY){
        position = position.add(new Vector2(speedX*deltaTime,speedY*deltaTime));
    }
    public void update(float deltaTime){

    }

    //-----------------------------------------------------------------------------------------------------------
    //Assessor mutator methods
    //-----------------------------------------------------------------------------------------------------------

    public void setWidth(float w){
        width = w;
        height = w*(float)sprite.getHeight()/sprite.getWidth();
    }

    public void setHeight(float h){
        height = h;
        width = h*(float)sprite.getWidth()/sprite.getHeight();
    }

    public void setScaleX(float sx){
        scaleX = sx;
    }
    public void setScaleY(float sy){
        scaleY = sy;
    }
    public void setScale(float sx, float sy){
        scaleX = sx;
        scaleY = sy;
    }

    public void setPos(float x, float y){
        position.x = x;
        position.y = y;
    }
    public Vector2 getPos(){
        return position;
    }

    public void setDir(float x, float y){
        direction.x = x;
        direction.y = y;
        direction = direction.getNormal();
    }
    public void setDir(Vector2 d){
        direction = d.getNormal();
    }
    public Vector2 getDir(){
        return direction;
    }

    public RectF getBounds(){
        float top = position.y -offset.y*height*Math.abs(scaleY)+drawDisplacement.y;
        float left =position.x -offset.x*width*Math.abs(scaleX)+drawDisplacement.x;
        float bottom = (top+height*Math.abs(scaleY))+drawDisplacement.y;
        float right = (left + width*Math.abs(scaleX))+drawDisplacement.x;
        return new RectF(left,top,right,bottom);
    }
    public float getBottom(){
        return (getTop()+height*Math.abs(scaleY));
    }
    public float getTop(){
        return (position.y -offset.y*height*Math.abs(scaleY));
    }
    public float getLeft(){
        return (position.x -offset.x*width*Math.abs(scaleX));
    }
    public float getRight(){
        return (getLeft() + width*Math.abs(scaleX));
    }
    public Vector2 getCenter(){
        RectF b = getBounds();
        return new Vector2(b.centerX(), b.centerY());
    }

    public void setSpeed(float s){
        speed = s;
    }
    public float getSpeed(){
        return speed;
    }

    public void setVelocity(float vx, float vy){
        speed = (float)Math.sqrt(vx*vx + vy*vy);
        direction = new Vector2(vx,vy).getNormal();
        velocity = direction.multiply(speed);
    }
    public void setVelocity(Vector2 v){
        setVelocity(v.x,v.y);
    }
    public Vector2 getVelocity(){
        return direction.multiply(speed);
    }

    public void setParent(GameObject p){
        parent = p;
        localPosition = position.sub(p.getPos());
        if(p.centerPivot){
            localPosition = position.sub(p.getCenter());
        }

        localRotation = rotation-p.rotation;
    }
    public void removeParent(){
        parent = null;
        localPosition = new Vector2(0,0);
        localRotation = 0;
    }

    public void setSprite(Bitmap sprite){
        srcRect = new RectF(0,0,sprite.getWidth(),sprite.getHeight());
        this.sprite = sprite;
    }

    public Bitmap getSprite(){
        return sprite;
    }



}
