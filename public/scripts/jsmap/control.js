import {view} from "./view.js"
import {model} from "./model.js"
"use strict"

export const control = {
  readInput: {
    execute: function(){
      model.readInput()
    },
    add:function(){
      view.elements.read.onclick = this.execute
    },
  },
  saveInput: {
    execute: function(){
      model.saveInput()
    },
    add:function(){
      view.elements.saveInput.onclick = this.execute
    },
  },
  saveOutput: {
    execute: function(){
      model.saveOutput()
    },
    add:function(){
      view.elements.saveOutput.onclick = this.execute
    },
  },
  sendData:{
     execute: function(){
      model.sendData()
    },
    add:function(){
      view.elements.sendData.onclick = this.execute
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
  keyDown: {
    execute:function(e){
      model.keyDown(e)
    },
    add: function(){
      document.onkeydown=this.execute
    }
  },
  initialize: function(){
    //add method
    const controls = [
      this.readInput,
      this.saveInput,this.saveOutput,
      this.sendData,
      this.resize, this.keyDown
    ] 
    controls.forEach(control =>control.add())
    model.initialize()
  },
}
