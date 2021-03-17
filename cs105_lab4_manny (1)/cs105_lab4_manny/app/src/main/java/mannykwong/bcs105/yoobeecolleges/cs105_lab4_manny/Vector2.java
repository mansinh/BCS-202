package mannykwong.bcs105.yoobeecolleges.cs105_lab4_manny;

import android.graphics.Matrix;

import androidx.annotation.NonNull;

//**************************************************************************************************
//Math class for 2d vector calculations
//**************************************************************************************************
public class Vector2 {
    public float x,y,length;
    Vector2 normal;

    public Vector2(float x, float y){
        this.x = x;
        this.y = y;
    }

    public Vector2 getNormal(){
        getLength();
        if(length > 0) {
            normal = new Vector2(x / length, y / length);
        }
        else {
            normal = new Vector2(0, 0);
        }
        return normal;
    }

    public float getLength(){
        length = (float)Math.sqrt(x*x + y*y);

        return length;
    }

    //Multplication with a scalar value
    public Vector2 multiply(float a){

        return new Vector2(a*x,a*y);
    }

    //Element by element multiplication with another vector
    public Vector2 multiply(Vector2 v){

        return new Vector2(v.x*x,v.y*y);
    }

    //Dot multiplication / projection onto another vector
    public float dot(Vector2 v){
        return v.x*x + v.y*y;
    }

    //Vector addition and subtraction
    public Vector2 add(Vector2 v){
        return new Vector2(x+v.x,y+v.y);
    }
    public Vector2 sub(Vector2 v){
        return new Vector2(x-v.x,y-v.y);
    }


    //Return a random vector with elements of range -1 to 1
    public static Vector2 getRandom(){
        return new Vector2((float)(Math.random()-0.5f)*2,(float)(Math.random()-0.5f)*2);
    }

    //Calculate the distance between two vectors
    public static float distance(Vector2 v, Vector2 u){
        float dx = v.x - u.x;
        float dy = v.y - u.y;

        return (float)Math.sqrt(dx*dx+dy*dy);
    }

    //Rotate a vector by degrees
    public static Vector2 rotate(Vector2 v, float degrees){
        double rad = Math.toRadians(degrees);
        float cos = (float)Math.cos(rad);
        float sin = (float)Math.sin(rad);
        return new Vector2(cos*v.x - sin*v.y, cos*v.y+sin*v.x);
    }

    @NonNull
    @Override
    public String toString() {
        super.toString();
        return "("+x+", "+y+")";
    }
}
