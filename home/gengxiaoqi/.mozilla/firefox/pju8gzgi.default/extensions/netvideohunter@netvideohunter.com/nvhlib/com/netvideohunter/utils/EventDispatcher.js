var EXPORTED_SYMBOLS = ["EventDispatcher"]; 

// EventDispatcher
var EventDispatcher=function(){
    this.listeners=[];

    this.addEventListener=function(eventType,callback,target){
        if(this.listenerExists(eventType,callback)) return false;
        if(!this.listeners[eventType]) this.listeners[eventType]=[];
        this.listeners[eventType].push({eventType:eventType, callback:callback, target:target});
    }

    this.removeEventListener=function(type,callback){
        if(!this.listeners[type]) return false;
        for(var l in this.listeners[type]){
            if(this.listeners[type][l]['callback']===callback){
                delete this.listeners[type][l];
            }
        }
        
    }

    this.removeAllEventlisteners=function(type){
        if(type){
            delete this.listeners[type];
        }else{
            this.listeners=[];
        }
    }
    
    this.listenerExists=function(type,callback){
        if(!this.listeners[type]) return false;
        for(var l in this.listeners[type]){
            if(this.listeners[type][l]['callback']===callback){
                return true;
            }
        }
    }

    this.dispatchEvent=function(event){
        
        if(!this.listeners[event.type]) return;        
        for(var l in this.listeners[event.type]){            
            var listener=this.listeners[event.type][l];
            listener['callback'].call(listener['target'],event);
        }
    }
}