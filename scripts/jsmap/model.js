import {view} from "./view.js"
import {arrow} from "./svg/arrow.js"
//import {parseParam, addParamToHash, removeParamFromHash} from "./hash.js"
"use strict"

export const model ={
  modeFlag:false,
  fullscreenFlag:false,
  asideWidth:null,
  sumHeight:null,
  geomap:null,
  simplemde:null,
  icon:{
    grayIcon: null,
    redIcon: null,
  },
  wiki: {
    title: null,
    keywords:null,
    longitude:null,
    latitude:null,
    text:null,
    html:null,
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

    view.elements.expandbutton.innerHTML = arrow.right
    
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
        shadowAnchor: [6, 32],
        popupAnchor: [-16, -32],
      })
    
    const markdownHeaderHeight = view.elements.markdownHeader.clientHeight
    const longlatHeight = view.elements.longlat.clientHeight
    const markdownInputHeight = view.elements.markdownInput.clientHeight
    const sumHeight = markdownHeaderHeight+longlatHeight+markdownInputHeight

    this.sumHeight = sumHeight

    const simplemdeHeight = bodyHeight - sumHeight
    view.elements.markdown.height = simplemdeHeight +"px"

    const simplemde = new SimpleMDE({
        element: view.elements.markdown,
        spellChecker:false,
        autoDownloadFontAwesome: false,
      })
    this.simplemde = simplemde
  },
  resize:function(){
    const bodyWidth = view.elements.body.clientWidth
    const bodyHeight = view.elements.body.clientHeight
    const asideWidth = this.expand.flag ? this.asideWidth:0
    const width = bodyWidth - asideWidth
    const height = bodyHeight
    const sumHeight = this.sumHeight 
    const simplemdeHeight = bodyHeight - sumHeight

    view.elements.map.style.width = width +"px"
    view.elements.map.style.height = height+"px" 
    view.elements.markdown.style.height = simplemdeHeight+"px" 
  },
  change:{
    pLongExecute:function(){
      const longitude = view.elements.positionLongitude.value
      view.elements.longlatLongitude.value = longitude
    },
    pLatExecute:function(){
      const latitude = view.elements.positionLatitude.value
      view.elements.longlatLatitude.value = latitude
    },
    lLongExecute:function(){
      const longitude = view.elements.longlatLongitude.value
      view.elements.positionLongitude.value = longitude
    },
    lLatExecute:function(){
      const latitude = view.elements.longlatLatitude.value
      view.elements.positionLatitude.value = latitude
    },
  },
  registerbutton:{
    execute:function(){
      const markdownArea = view.elements.markdownArea
      const mainContents = view.elements.mainContents
      markdownArea.className = model.modeFlag ? "hide" : "show"
      mainContents.className = model.modeFlag ? "show" : "hide"
      model.modeFlag =model.modeFlag? false :true 
      view.elements.title.value = "" 
      view.elements.keywords.value = "" 
      model.simplemde.value("")
    },
  },
  edit:{
    execute: function(){
      model.registerbutton.execute()
      const simplemde = model.simplemde
      const longitude = model.wiki.longitude
      const latitude = model.wiki.latitude
      const title = model.wiki.title
      const keywords = model.wiki.keywords
      const text = model.wiki.text ? model.wiki.text : "";

      view.elements.longlatLongitude.value = longitude 
      view.elements.longlatLatitude.value = latitude 
      view.elements.title.value = title 
      view.elements.keywords.value = keywords 
      model.simplemde.value(text)
    }
  },
  fullscreen:{
    execute:function(){
      const fullscreenMode = view.elements.fullscreenMode   
      const mainContents = view.elements.mainContents
      const fullscreenTitle = view.elements.fullscreenTitle
      const fullscreenSection = view.elements.fullscreenSection
      mainContents.className = model.fullscreenFlag ? "show":"hide"
      fullscreenMode.className = model.fullscreenFlag ? "hide":"show"
      model.fullscreenFlag = model.fullscreenFlag ? false :true
      fullscreenTitle.textContent = model.wiki.title
      fullscreenSection.innerHTML = model.wiki.html

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
    }
  },
  plot:{
    marker: null,
    execute:function(){
      const geomap = model.geomap 
      if(this.marker){
        geomap.removeLayer(this.marker) 
      }
      const longitudeString = view.elements.positionLongitude.value
      const latitudeString = view.elements.positionLatitude.value
      const longitude = parseFloat(longitudeString)
      const latitude = parseFloat(latitudeString)
      if(!isNaN(longitude) && !isNaN(latitude)){
        const marker = L
          .marker([longitude, latitude],{icon:model.icon.grayIcon})
          .addTo(geomap)
        geomap.panTo(new L.LatLng(longitude, latitude))
        this.marker = marker
      }
    }
  },
  post:{
    execute:function(){
      const simplemde = model.simplemde
      const geomap = model.geomap 

      const wikiElement = view.elements.wiki
      const longitudeString = view.elements.longlatLongitude.value
      const latitudeString = view.elements.longlatLatitude.value
      const longitude = parseFloat(longitudeString)
      const latitude = parseFloat(latitudeString)
      if(!isNaN(longitude) && !isNaN(latitude)){
        const title = view.elements.title.value
        const keywords = view.elements.keywords.value
        const text = simplemde.value()
        const html = simplemde.options.previewRender(text)

        model.wiki.longitude = longitude 
        model.wiki.latitude = latitude 
        model.wiki.title = title
        model.wiki.keywords = keywords 
        model.wiki.text = text 
        model.wiki.html = html 

        const marker = L.marker([longitude, latitude])
          .addTo(geomap)
          .bindPopup(title)
          .openPopup();
        geomap.panTo(new L.LatLng(longitude, latitude))
        model.close.execute()

        view.elements.longlatLongitude.value = ""
        view.elements.longlatLatitude.value = ""
        view.elements.title.value = ""
        view.elements.keywords.value = ""
        simplemde.value("")
        view.elements.wikiTitle.textContent = title
        view.elements.wikiHTML.innerHTML = html 
      }
    },
  }
}
