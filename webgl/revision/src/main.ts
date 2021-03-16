
import { mat4 } from "gl-matrix";

class App {
    myMatrix:mat4=mat4.create();
    constructor(){
        console.log(this.myMatrix)
    }
    

    
}

new App();