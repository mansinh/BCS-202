package mannykwong.bcs105.yoobeecolleges.cs105_lab4_manny;

import android.content.Intent;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

public class SpashScreen extends AppCompatActivity implements Runnable{
    Thread thread;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_spash_screen);

        thread = new Thread(this);
        thread.start();
    }

    void toMenu() {
        Intent i = new Intent(this, GameMenu.class);
        startActivity(i);
    }

    //Show splash screen for 3 seconds then move to game menu activity
    @Override
    public void run() {
        try{
            thread.sleep(3000);
        }
        catch (Exception e){

        }
        toMenu();
    }
}
