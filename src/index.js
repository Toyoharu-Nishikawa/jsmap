const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
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

const mongoURL = 'mongodb://mongo:27017';
app.use(bodyParser.urlencoded({
        extended: true
}));
app.use(bodyParser.json());

app.set('port', 5000);
app.use(express.static(__dirname + '/public'));

app.all('/node', function(request, response) {
  response.json({status:"jsmap server is working"})
});


app.all('/node/upload',(request,response)=>{
  const param = request.body
  const id = param.id
  const longitude = parseFloat(param.longitude)
  const latitude = parseFloat(param.latitude)
  const title = param.title
  const keywords = param.keywords.split(",").map(v=>v.trim())
  const text = param.text

  const wiki = {
    longitude: longitude,
    latitude: latitude,
    title: title,
    keywords: keywords,
    text: text
  }

  let client = null
  const main = async ()=>{
    try{
      client = await MongoClient.connect(mongoURL)
      const db = client.db("map")
      const collection = db.collection("wiki");
      console.log("id",id)
      if(id){
        const result = await collection.update(
            {_id:ObjectId(id)},
            {$set:wiki},
            {upsert:true}
         )
        response.json({register:true,id:id}) 
      }
      else {
        const result = await collection.insert(wiki)
        response.json({register:true, id:result.insertedIds[0]}) 
      }
    }
    catch(e){
      response.json({register:false, message:e.message})
    }
    finally{
      client.close()
    }
  }
  main()
}) 

app.all('/node/initial',(request,response)=>{
  let client = null
  const param = request.body
  console.log(param)
  const main = async ()=>{
    try{
      client = await MongoClient.connect(mongoURL)
      const db = client.db("map")
      const collection = db.collection("wiki")

      const reg = param.join("|")

      const findCondition = (param.length===1 && param[0]==="") ?{}:
        {$or:[
            {title:{$regex:reg}},
            {keywords:{$regex:reg}},
          ]
        }
      console.log(findCondition)
      const result = await collection.find(findCondition,
          {projection:{title:1, _id: 1,longitude: 1, latitude:1}})
        .toArray()
      response.json({result:result })
    }
    catch(e){
      response.json({result:false, message:e.message})
    }
    finally{
      client.close()
    }
  }
  main()
})
 
app.all('/node/getone',(request,response)=>{
  const param = request.body
  const id = param.id

  let client = null
  const main = async ()=>{
    try{
      client = await MongoClient.connect(mongoURL)
      const db = client.db("map")
      const collection = db.collection("wiki");
      const result = await collection.findOne({_id:ObjectId(id)},
          {projection:{title:1, longitude: 1, latitude:1, text:1, keywords:1}})
 
      response.json({result:result })
    }
    catch(e){
      response.json({result:false, message:e.message})
    }
    finally{
      client.close()
    }
  }
  main()
})
 
app.all('/node/deleteone',(request,response)=>{
  const param = request.body
  const id = param.id

  let client = null
  const main = async ()=>{
    try{
      client = await MongoClient.connect(mongoURL)
      const db = client.db("map")
      const collection = db.collection("wiki")
      const result = await collection.remove({_id:ObjectId(id)})
      
 
      response.json({id:result })
    }
    catch(e){
      response.json({result:false, message:e.message})
    }
    finally{
      client.close()
    }
  }
  main()
})
 
app.listen(app.get('port'), function() {
      console.log("Node app is running at localhost:" + app.get('port'))
});
