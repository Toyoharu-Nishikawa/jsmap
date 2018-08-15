const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs')
const assert = require('assert')

const log = require('log');

try{
  fs.accessSync("/var/log/node");
}
catch(err){
    fs.mkdirSync("/var/log/node")
}
const logger = new log("info", fs.createWriteStream("/var/log/node/node.access.log",{flags:"a"}));

app.use(bodyParser.urlencoded({
        extended: true
}));
app.use(bodyParser.json());

app.set('port', 5000);
app.use(express.static(__dirname + '/public'));

app.all('/node', function(request, response) {
  response.json({status:"jsonee server is working"})
});

app.all('/node/mirror', function(request, response) {
  response.json(request.body)
});


app.all('/node/server',(request,response)=>{
  const param = request.body
  console.log(param)
  if(param.hasOwnProperty("jsoneeSendURL")){
    const url = param.jsoneeSendURL
    console.log(`send to ${url}`)
    logger.info(`send to ${url}`)
    delete param.jsoneeSendURL 

    const data ={
      body:JSON.stringify(param),
      headers: {
        'user-agent': 'Mozilla/4.0 MDN Example',
        'content-type': 'application/json'
      },
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
    }
    const send = async() =>{
      try{
        const res = await fetch(url,data)
        console.log(response.status)
        const json = await res.json()
        response.json(json)
      }
      catch(e){
        console.log(e.message)
        const json = {
          error: e.message
        }
        response.json(json)
      }
    }
  }
  else{
    console.log("error:the key of jsoneeSendURL is reserved for jsonee's server")
    logger.info("error:the key of jsoneeSendURL is reserved for jsonee's server")
    response.json({
      error:"the key of jsoneeSendURL is reserved for jsonee's server"
    })
  }
})


app.listen(app.get('port'), function() {
      console.log("Node app is running at localhost:" + app.get('port'))
});
