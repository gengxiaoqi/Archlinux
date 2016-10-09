Components.utils.import("resource://nvhlib/com/netvideohunter/utils/EventDispatcher.js"); 
var EXPORTED_SYMBOLS = ["List"]; 

// === List ===

var List=function(){
	EventDispatcher.call(this);
	var items=[];

	this.addItem=function(item){
		items.push(item)       
		this.dispatchEvent({type:'itemAdded',item:item})
	}

	this.removeItem=function(item){
		var id=thisindexOf(item)
		if(id==-1) return false;
		delete items[id];
		this.dispatchEvent({type:'itemRemoved',item:item})
	}
    
    this.removeAll=function(){
        items=[];
        this.dispatchEvent({type:'cleared'});
    }

	this.indexOf=function(item){
		for(var i=0;i<items.length;i++){
			if(items[i]===item) return i
		}
		return -1
	}

	this.getItemByIndex=function(index){
		return items[index];
	}
    
    this.getLength=function(){
        return items.length;
    }
    
    this.forEach=function(func,target){
        for(var i in items){
			func.call(target,items[i],i);
		}
    }
	
}