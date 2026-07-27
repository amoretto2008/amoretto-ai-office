(function(){
  "use strict";
  if(!window.crypto||typeof window.crypto.randomUUID==="function")return;
  const makeUuid=function(){
    const bytes=new Uint8Array(16);
    if(typeof window.crypto.getRandomValues==="function")window.crypto.getRandomValues(bytes);
    else for(let i=0;i<bytes.length;i+=1)bytes[i]=Math.floor(Math.random()*256);
    bytes[6]=(bytes[6]&15)|64;
    bytes[8]=(bytes[8]&63)|128;
    const hex=[...bytes].map((value)=>value.toString(16).padStart(2,"0"));
    return `${hex.slice(0,4).join("")}-${hex.slice(4,6).join("")}-${hex.slice(6,8).join("")}-${hex.slice(8,10).join("")}-${hex.slice(10,16).join("")}`;
  };
  try{Object.defineProperty(window.crypto,"randomUUID",{value:makeUuid,configurable:true});}
  catch{window.crypto.randomUUID=makeUuid;}
})();
