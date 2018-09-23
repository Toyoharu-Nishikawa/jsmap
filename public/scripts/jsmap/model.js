import {view} from "./view.js"
import {arrow} from "./svg/arrow.js"
import {parseParam, addParamToHash, removeParamFromHash} from "./hash.js"
"use strict"

export const model ={
  initialURL: "/jsmap/node/initial",
  uploadURL: "/jsmap/node/upload",
  getOneURL: "/jsmap/node/getone",
  deleteOneURL: "/jsmap/node/deleteone",
  searchURL: "/jsmap/node/search",
  id:null,
  modeFlag:false,
  fullscreenFlag:false,
  deleteFlag:false,
  marker: null,
  markers: null,
  asideWidth:null,
  sumHeight:null,
  geomap:null,
  editor:null,
  miniwiki:null,
  fullscreenwiki:null,
  icon:{
    grayIcon: null,
    redIcon: null,
  },
  wiki: {
    title: null,
    keywords:null,
    latitude:null,
    longitude:null,
    text:null,
  },
  initialize: function(){
    const bodyWidth = view.elements.body.clientWidth
    const bodyHeight = view.elements.body.clientHeight
    const asideWidth = view.elements.aside.clientWidth
    this.asideWidth = asideWidth
    const width = bodyWidth - asideWidth
    const height = bodyHeight

    view.elements.map.style.width = width +"px"
    view.elements.map.style.height = height+"px" 

    view.elements.expandbutton.innerHTML = arrow.left
    model.parseHash() 
    const  geomap = L
      .map('map',{editable:true})
      .setView([36.3219088　, 139.0032936], 4)
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18
      }).addTo(geomap)
    this.geomap = geomap
    this.icon.grayIcon = L.icon({
        iconUrl: "scripts/leaflet/images/marker-icon-gray.png", 
        shadowUrl:"scripts/leaflet/images/marker-shadow.png", 
        iconSize: [32, 32],
        shadowSize: [41, 41],
        iconAnchor: [16, 32],
        shadowAnchor: [12, 40],
        popupAnchor: [-16, -32],
      })

    const searchWords = model.getSearchWords()
    const searchList = searchWords !=="" ? searchWords: [""] 
    view.elements.search.value = searchList.join(" ")
 
    const url = model.initialURL 
    const data = {
      body: JSON.stringify(searchList),
      cache: "no-cache",
      credentials: "same-origin",
      headers: {"content-type":"application/json"},
      method: "POST",
      mode: "cors",
      redirect: "follow",
      referror: "no-referror",
    }
    const getposition = async ()=>{
      try{
        const response = await fetch(url, data)
        const json = await response.json()
        console.log(json.result)
        if(json.result){
          const markers = json.result.map(v=>{
              const clickFunc = model.getInformation(v._id, true,null) 
              const marker =  L.marker([v.latitude , v.longitude,])
                .addTo(geomap)
                .bindPopup(v.title)
                .on("click", clickFunc)
              return marker
            })
          model.markers = markers
        }
        else{
          throw new Error(json.message)
        }
       }
       catch(e){
         console.log(e.message)
         alert("jsmap server is not working")
      }
    }
    getposition()

    const editor = new tui.Editor({
      el: view.elements.markdown,
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      height: "auto",
      viewer:false,
      usageStatistics:false,
      exts: [
        {
          name: 'chart',
          minWidth: 100,
          maxWidth: 600,
          minHeight: 100,
          maxHeight: 300,
        },
        'scrollSync',
        'colorSyntax',
        'uml',
        'mark',
        'table' 
      ]
    });

    model.editor = editor
    console.log(editor)

    const miniwiki = new tui.Editor.factory({
      el:view.elements.wikiHTML,
      height: "auto",
      usageStatistics:false,
      hideModeSwitch:false,
      toolbarItems:[],
      viewer:true,
      initialValue:"",
    }) 
    model.miniwiki =miniwiki

    const fullscreenwiki = new tui.Editor.factory({
      el:view.elements.fullscreenSection,
      height: "auto",
      usageStatistics:false,
      hideModeSwitch:false,
      toolbarItems:[],
      viewer:true,
      initialValue:"",
    }) 

    model.fullscreenwiki =fullscreenwiki
  },
  getSearchWords:function(){
    const param = decodeURIComponent(location.search).substring(1).split('&')
    const data = new Map()
    param.forEach(v=>{
      const p = v.split("=")
      data.set(p[0],p[1]) 
    })
    const searchWords = data.has("search") ? data.get("search").split("+"):""

    return searchWords 
  },
  parseHash:function(){
    const param = parseParam(location.hash.slice(1))     
    console.log(param)
    if(param.size>0){
      if(param.has("mode")&&param.has("id")){
        const mode = param.get("mode")
        const id = param.get("id")
        model.id=String(id)
        if(mode==="fullscreen" && id !=="null"){
          const run = model.getInformation(id,false, model.fullscreen.execute)
          run()
          console.log("ok")
        }
      }
    }
  }, 
  getInformation:function(id,setMiniWikiFlag=true, callback){
    console.log(id)
    const url = model.getOneURL
    const data = {
      body: JSON.stringify({id:id}),
      cache: "no-cache",
      credentials: "same-origin",
      headers: {"content-type":"application/json"},
      method: "POST",
      mode: "cors",
      redirect: "follow",
      referror: "no-referror",
    }
    const send = async(eve) =>{
      try{
        const response = await fetch(url, data)
        const json = await response.json()
        if(json.result){
          const result = json.result
          const latitude = result.latitude
          const longitude = result.longitude
          const title = result.title
          const keywords = result.keywords
          const text = result.text

          model.setWikiObj.execute( latitude, longitude, title,keywords, text)
          if(setMiniWikiFlag){
            model.setMiniWiki.execute(title, text)
          }
          model.id=id
          model.marker = eve?eve.target:null
          if(callback){
            callback()
          }
          else {
            return new Promise((resolve, reject)=>{resolve()})
          }
        }
        else{
          throw new Error(json.message)
        }
      }
      catch(e){
        console.log(e.message)
        alert("jsmap server is not working")
        return new Promise((resolve, reject)=>{resolve()})
      }
    }
    return send
  },
  search:{
    execute:function(){
      const searchWords = view.elements.search.value
      const searchList = searchWords.split(/\s+/g) 
    }
  },
  resize:function(){
    const bodyWidth = view.elements.body.clientWidth
    const bodyHeight = view.elements.body.clientHeight
    const asideWidth = this.expand.flag ? this.asideWidth:0
    const width = bodyWidth - asideWidth
    const height = bodyHeight

    const markdownHeaderHeight = view.elements.markdownHeader.clientHeight
    const longlatHeight = view.elements.longlat.clientHeight
    const markdownInputHeight = view.elements.markdownInput.clientHeight
    const sumHeight = markdownHeaderHeight+longlatHeight+markdownInputHeight
 
    const markdownHeight = bodyHeight - sumHeight-40
    view.elements.markdownText.style.height = markdownHeight +"px"
    view.elements.markdown.style.height = markdownHeight+"px" 
    model.editor.height(markdownHeight||300)
 
    view.elements.map.style.width = width +"px"
    view.elements.map.style.height = height+"px" 
  },
  change:{
    pLatExecute:function(){
      const latitude = view.elements.positionLatitude.value
      view.elements.longlatLatitude.value = latitude
    },
    pLongExecute:function(){
      const longitude = view.elements.positionLongitude.value
      view.elements.longlatLongitude.value = longitude
    },
    lLatExecute:function(){
      const latitude = view.elements.longlatLatitude.value
      view.elements.positionLatitude.value = latitude
    },
    lLongExecute:function(){
      const longitude = view.elements.longlatLongitude.value
      view.elements.positionLongitude.value = longitude
    },
  },
  registerbutton:{
    execute:function(deleteId = true){
      const markdownArea = view.elements.markdownArea
      const mainContents = view.elements.mainContents
      if(deleteId){
        model.id = null
        view.elements.delete.className = "deleteOff"
        model.deleteFlag= false 
      }
      else{
        view.elements.delete.className = "deleteOn"
        model.deleteFlag= true 
      }
      markdownArea.className = model.modeFlag ? "hide" : "show"
      mainContents.className = model.modeFlag ? "show" : "hide"
      model.modeFlag =model.modeFlag? false :true 

      const bodyHeight = view.elements.body.clientHeight
      const markdownHeaderHeight = view.elements.markdownHeader.clientHeight
      const longlatHeight = view.elements.longlat.clientHeight
      const markdownInputHeight = view.elements.markdownInput.clientHeight
      const sumHeight = markdownHeaderHeight+longlatHeight+markdownInputHeight
   
      const markdownHeight = bodyHeight - sumHeight-40
  
      view.elements.markdownText.style.height = markdownHeight +"px"
      view.elements.markdown.style.height = markdownHeight +"px"
      model.editor.height(markdownHeight)

      view.elements.title.value = "" 
      view.elements.keywords.value = "" 
      model.editor.setValue("")
    },
  },
  edit:{
    execute: function(){
      model.registerbutton.execute(false)
      const latitude = model.wiki.latitude
      const longitude = model.wiki.longitude
      const title = model.wiki.title
      const keywords = model.wiki.keywords
      const text = model.wiki.text ? model.wiki.text : "";

      view.elements.longlatLatitude.value = latitude 
      view.elements.longlatLongitude.value = longitude 
      view.elements.title.value = title 
      view.elements.keywords.value = keywords 
      model.editor.setValue(text)
    }
  },
  delete:{
    execute:function(){
        console.log(model.deleteFlag)
        console.log(model.id)
      const flag = model.deleteFlag && model.id
      if(!flag){
        return false
      }
      const confirmResult = confirm("Will you delete this data exactly?")
      if(!confirmResult){
        return false
      }
      const body = {
        id:model.id,
      }
      const url = model.deleteOneURL
      const data = {
        body: JSON.stringify(body),
        cache: "no-cache",
        credentials: "same-origin",
        headers: {"content-type":"application/json"},
        method: "POST",
        mode: "cors",
        redirect: "follow",
        referror: "no-referror",
      }
      const send = async() =>{
        try{
          const response = await fetch(url, data)
          const json = await response.json()
          if(!json.id){
            throw new Error(`data has not been saved yet. ${json.message}`) 
          }
          else{
            console.log(`successfully delete id:${model.id}`)
            const geomap = model.geomap
            geomap.removeLayer(model.marker) 
            model.clearRegister.execute()
            model.setMiniWiki.execute()
            model.close.execute()
            location.hash = "" 
          }
        }
        catch(e){
          console.log(e.message)
          alert("jsmap server is not working")
        }
      }
      send()
    },
  },
  fullscreen:{
    execute:function(){
      const fullscreenwiki = model.fullscreenwiki
      const fullscreenMode = view.elements.fullscreenMode   
      const mainContents = view.elements.mainContents
      const fullscreenTitle = view.elements.fullscreenTitle
      const fullscreenSection = view.elements.fullscreenSection
      const text = model.wiki.text
      const id =model.id
      fullscreenwiki.setValue(text)
      mainContents.className = model.fullscreenFlag ? "show":"hide"
      fullscreenMode.className = model.fullscreenFlag ? "hide":"show"
      model.fullscreenFlag = model.fullscreenFlag ? false :true
      fullscreenTitle.textContent = model.wiki.title
      addParamToHash("mode", "fullscreen")
      addParamToHash("id", id)
    }
  },
  close2:{
    execute:function(){
      const fullscreenMode = view.elements.fullscreenMode   
      const mainContents = view.elements.mainContents
      const fullscreenTitle = view.elements.fullscreenTitle
      const fullscreenSection = view.elements.fullscreenSection
      mainContents.className = model.fullscreenFlag ? "show":"hide"
      fullscreenMode.className = model.fullscreenFlag ? "hide":"show"
      model.fullscreenFlag = model.fullscreenFlag ? false :true
     location.hash = "" 
    }
  },
  expand:{
    flag:true,
    execute:function(){
      if(this.flag){
        view.elements.aside.className="hide"
        this.flag=false
        view.elements.expandbutton.innerHTML = arrow.right
        window.dispatchEvent(new Event('resize'));
      }
      else{
        view.elements.aside.className=null
        this.flag=true
        view.elements.expandbutton.innerHTML =arrow.left 
        window.dispatchEvent(new Event('resize'));
      }
    },
  },
  close:{
    execute:function(){
      const markdownArea = view.elements.markdownArea
      const mainContents = view.elements.mainContents
      markdownArea.className = model.modeFlag ? "hide" : "show"
      mainContents.className = model.modeFlag ? "show" : "hide"
      model.modeFlag =model.modeFlag? false :true 
     location.hash = "" 
    }
  },
  plot:{
    tmpMarker:null,
    execute:function(){
      const geomap = model.geomap 
      if(this.tmpMarker){
        geomap.removeLayer(this.tmpMarker) 
      }
      const latitudeString = view.elements.positionLatitude.value
      const longitudeString = view.elements.positionLongitude.value
      const latitude = parseFloat(latitudeString)
      const longitude = parseFloat(longitudeString)
      if(!isNaN(latitude) &&!isNaN(longitude)){
        const marker = L
          .marker([latitude, longitude,],
            {icon:model.icon.grayIcon,draggable:"true"})
          .addTo(geomap)
          .on("drag", model.plot.drag)
        geomap.panTo(new L.LatLng(latitude, longitude,))
        this.tmpMarker = marker
        console.log(marker)
      }
    },
    drag:function(e){
      const marker = e.target
      const position = marker.getLatLng()
      const latitude = position.lat 
      const longitude = position.lng
      view.elements.positionLatitude.value = latitude
      view.elements.positionLongitude.value = longitude
    }
  },
  post:{
    execute:function(){
      const editor = model.editor
      const wikiElement = view.elements.wiki
      const latitudeString = view.elements.longlatLatitude.value
      const longitudeString = view.elements.longlatLongitude.value
      const latitude = parseFloat(latitudeString)
      const longitude = parseFloat(longitudeString)
      if( !isNaN(latitude) && !isNaN(longitude) ){
        const id = model.id
        console.log(id)
        const title = view.elements.title.value
        const keywords = view.elements.keywords.value
        const text = editor.getValue()

        const body = {
          id:id,
          latitude:latitude,
          longitude:longitude,
          title:title,
          keywords:keywords,
          text: text,
        }
        const url = model.uploadURL
        const data = {
          body: JSON.stringify(body),
          cache: "no-cache",
          credentials: "same-origin",
          headers: {"content-type":"application/json"},
          method: "POST",
          mode: "cors",
          redirect: "follow",
          referror: "no-referror",
        }
        const send = async() =>{
          try{
            const response = await fetch(url, data)
            const json = await response.json()
            if(!json.register){
              throw new Error(`data has not been saved yet. ${json.message}`) 
            }
            else{
              if(json.hasOwnProperty("id")){
                const id = json.id
                model.id = id
                console.log("result",id)
                model.post.setWiki(id, latitude,longitude, title,keywords, text)
              }
              else{
                console.log("error",json)
              }
            }
          }
          catch(e){
            console.log(e.message)
            alert("jsmap server is not working")
          }
        }
        send()
      }
    },
    setWiki:function(id, latitude,longitude,  title,keywords, text){
      const geomap = model.geomap 
      if(model.marker){
        geomap.removeLayer(model.marker)
      }
      const clickFunc = model.getInformation(id,true) 
      const marker = L.marker([latitude, longitude,])
        .addTo(geomap)
        .bindPopup(title)
        .openPopup()
        .on("click", clickFunc)

      geomap.panTo(new L.LatLng(latitude,longitude, ))
      model.marker = marker

      model.setWikiObj.execute(latitude, longitude,title,keywords, text)
      model.clearRegister.execute()
      model.setMiniWiki.execute(title, text)
      model.close.execute()
    },
  },
  clearRegister:{
    execute:function(){
      const editor = model.editor
   
      view.elements.longlatLatitude.value = ""
      view.elements.longlatLongitude.value = ""
      view.elements.title.value = ""
      view.elements.keywords.value = ""
      editor.setValue("")
    },
  },
  setWikiObj:{
    execute:function( latitude, longitude, title,keywords, text){
      model.wiki.latitude = latitude 
      model.wiki.longitude = longitude 
      model.wiki.title = title
      model.wiki.keywords = keywords 
      model.wiki.text = text 
    },
  },
  setMiniWiki:{
    execute:function(title, text){
      view.elements.wikiTitle.textContent = title? title:""
      const textValue = text? text : ""
        model.miniwiki.setValue(textValue)
    }
  }
}
