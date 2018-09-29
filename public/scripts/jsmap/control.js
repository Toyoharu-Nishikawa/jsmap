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
  edit:{
    execute: function(){
      model.edit.execute()
    },
    add: function(){
      view.elements.edit.onclick = this.execute
    }
  },
  fullscreen:{
    execute: function(){
      model.fullscreen.execute()
    },
    add: function(){
      view.elements.fullscreen.onclick = this.execute
    },
  },
  close2:{
    execute:function(){
      model.close2.execute()
    },
    add:function(){
      view.elements.close2.onclick = this.execute
    },
  },
  close: {
    execute:function(){
      model.close.execute()
    },
    add:function(){
      view.elements.close.onclick = this.execute
    }
  },
  plot:{
    execute: function(){
      model.plot.execute()
    },
    add: function(){
      view.elements.positionPlot.onclick = this.execute
    },
  },
  post:{
    execute:function(){
      model.post.execute()
    },
    add:function(){
      view.elements.post.onclick = this.execute
    }
  },
  delete:{
    execute:function(){
      model.delete.execute()
    },
    add:function(){
      view.elements.delete.onclick = this.execute
    }
  },
  initialize: function(){
    //add method
    const controls = [
      this.expand,
      this.resize,
      this.register,
      this.edit,
      this.delete,
      this.fullscreen,
      this.close2,
      this.close,
      this.plot,
      this.post,
    ] 
    controls.forEach(control =>control.add())
    
    model.initialize()
  },
}
