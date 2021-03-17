package mannykwong.bcs105.yoobeecolleges.cs105_lab4_manny;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.SoundPool;

public class SoundEffects {
    SoundPool soundPool;
    public static SoundEffects instance;
    Context context;
    public static int HIT = 2,EXPLOSION = 3,PEW = 0,SHOOT = 1,ROOSTER = 4, DAMAGE = 5, DEATH = 6;
    int[] soundId;
    public static int MAXSTREAMS = 10;
    private float volumeMul = 0.3f;


    public SoundEffects(Context context){
        //Singleton
        if(instance == null){
            instance = this;
            this.context = context;

            AudioAttributes.Builder attrBuilder = new AudioAttributes.Builder();
            attrBuilder.setUsage(AudioAttributes.USAGE_GAME);
            attrBuilder.setFlags(AudioAttributes.FLAG_LOW_LATENCY);

            SoundPool.Builder poolBuilder = new SoundPool.Builder();
            poolBuilder.setMaxStreams(MAXSTREAMS);
            poolBuilder.setAudioAttributes(attrBuilder.build());

            soundPool = poolBuilder.build();

            //List of available sound effects
            soundId = new int[7];
            soundId[HIT] = soundPool.load(context,R.raw.hit,1);
            soundId[EXPLOSION] = soundPool.load(context,R.raw.explosion,4);
            soundId[PEW] = soundPool.load(context,R.raw.pew,3);
            soundId[ROOSTER] = soundPool.load(context,R.raw.rooster,1);
            soundId[SHOOT] = soundPool.load(context,R.raw.shoot,1);
            soundId[DAMAGE] = soundPool.load(context,R.raw.damage,2);
            soundId[DEATH] = soundPool.load(context,R.raw.death_sound_effect,10);
        }
    }

    //Play with default attributes
    public void play(int effect){

        soundPool.play(soundId[effect],volumeMul,volumeMul,1,0,1);

    }

    //Play with custom attributes
    public void play(int effect, float volume,int priority, float rate){

        soundPool.play(soundId[effect],volume*volumeMul,volume*volumeMul,priority,0,rate);
    }

    public void release(){
        soundPool.release();
    }
}
