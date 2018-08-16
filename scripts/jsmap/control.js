import {view} from "./view.js"
import {model} from "./model.js"
"use strict"

export const control = {
  expand: {
    execute: function(){
      model.expand.execute()
    },
    add:function(){
      view.elements.expandbutton.onclick = this.execute
    },
  },
  resize:{
    execute:function(){
        model.resize()
    },
    add:function(){
      window.onresize=this.execute
    }, 
  },
  register:{
    execute:function(){
        model.registerbutton.execute()
    },
    add:function(){
      view.elements.registerbutton.onclick = this.execute
    }, 
  },

  initialize: function(){
    //add method
    
    const controls = [
      this.expand,
      this.resize,
      this.register,
    ] 
    controls.forEach(control =>control.add())
    
    model.initialize()
  },
}
