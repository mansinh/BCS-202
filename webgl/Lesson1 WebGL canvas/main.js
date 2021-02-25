console.log("boo!")

const CANVAS = document.getElementById("canvas");
const GL = CANVAS.getContext("webgl2");

start();

function start(){
    GL.viewport(0,0,CANVAS.clientWidth, CANVAS.clientHeight);
    GL.clearColor(0,0,0,1);
   draw();
    
}

function draw(){
    GL.clear(GL.COLOR_BUFFER_BIT);
}