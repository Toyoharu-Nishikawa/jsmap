import {view} from "./view.js"
import {arrow} from "./svg/arrow.js"
//import {parseParam, addParamToHash, removeParamFromHash} from "./hash.js"
"use strict"

export const model ={
  asideWidth:null,
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
    
    const  geomap = L.map('map').setView([36.3219088　, 139.0032936], 14);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18
      }).addTo(geomap);
      
    const simplemde = new SimpleMDE({
        element: view.elements.markdown,
        spellChecker:false,
      })
  },
  resize:function(){
    const bodyWidth = view.elements.body.clientWidth
    const bodyHeight = view.elements.body.clientHeight
    const asideWidth = this.expand.flag ? this.asideWidth:0
    const width = bodyWidth - asideWidth
    const height = bodyHeight
 
    view.elements.map.style.width = width +"px"
    view.elements.map.style.height = height+"px" 
  },
  registerbutton:{
    flag:false,
    execute:function(){
      const markdownArea = view.elements.markdownArea
      markdownArea.className = this.flag ? "hide" : "show"
      this.flag =this.flag? false :true 
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
        view.elements.aside.className="show"
        this.flag=true
        view.elements.expandbutton.innerHTML =arrow.left 
        window.dispatchEvent(new Event('resize'));
      }
    },
  }
}
