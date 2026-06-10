const { spawn } = require("child_process");

function runPython(file, args=[]){
  return new Promise((resolve,reject)=>{
    const py = spawn("python",[file,...args]);
    let data = "";
    py.stdout.on("data",(chunk)=> data += chunk.toString());
    py.on("close",()=> resolve(data));
    py.on("error",reject);
  });
}

module.exports = { runPython };
