Components.utils.import("resource://nvhlib/com/netvideohunter/utils/EventDispatcher.js");
Components.utils.import("resource://nvhlib/com/netvideohunter/utils/Logger.js");

var EXPORTED_SYMBOLS = ["HashList"];

// === List ===

var HashList=function(hashBy,saveTo){
	EventDispatcher.call(this);
	this.saveToPreference=saveTo;
	this.saveEachChange=false;
	var self=this;
	var items=new Object();
	var hashBy=hashBy;
    var length=0;
    this.limit=null
    var orderedItemIds=[]

	this.addItem=function(item){
		if(typeof(item[hashBy])=='undefined') throw new Error("item."+self.hashBy+" must not be null");
		var oldItem=null
	    if(typeof(items[item[hashBy]])!=='undefined'){
			oldItem=items[item[hashBy]]
			this.removeItem(item[hashBy]);
		}
		items[item[hashBy]]=item;
        length++;
		
		if(oldItem===null){
			orderedItemIds.push(item[hashBy])
			Logger.log('orderedItemIds: ',orderedItemIds)
			if(this.limit!==null && length>this.limit){
				this.removeItem(orderedItemIds[0])
			}
			this.dispatchEvent({type:'itemAdded',item:item})
		}else{
			this.dispatchEvent({type:'itemUpdated',item:item})
		}
		if(this.saveEachChange){
			this.save();
		}
	}

	this.removeItem=function(id){
		if(typeof(items[id])=='undefined') return false;
        var item = items[id];
		delete items[id];
		var i=orderedItemIds.indexOf(item[hashBy])
		if(i!==-1){
			orderedItemIds.splice(i,1)
		}
        length--;
		if(this.saveEachChange) this.save();
		this.dispatchEvent({type:'itemRemoved',item:item})
	}

    this.removeAll=function(){
        items=new Object();
        orderedItemIds=[]
		length=0;
		if(this.saveEachChange) this.save();
        this.dispatchEvent({type:'cleared'});
    }

	this.getItemById=function(id){
		if(id===null || id===undefined) return null
		if(typeof(items[id])=='undefined') return null;
		return items[id];
	}

    this.getLength=function(){
        return length;
    }

	this.getLastId=function(){
		return orderedItemIds[0] || null;
	}

    this.forEach=function(func,target){
        for(var i=0;i<orderedItemIds.length;i++){
			func.call(target,items[orderedItemIds[i]],orderedItemIds[i],i);
		}
    }

    this.getItems=function(){
    	return items
    }

	this.save=function(){

		var jsonItems=JSON.stringify({items:items, orderedItemIds:orderedItemIds});
		Logger.log('jsonItems: ',jsonItems)
		Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).setCharPref(this.saveToPreference,jsonItems);
	}

	this.load=function(){
		this.dispatchEvent({type:'cleared'});

		var jsonData=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).getCharPref(this.saveToPreference);

		if(!jsonData || jsonData=='[]') return false;
		var data=JSON.parse(jsonData);
		Logger.log('loaded JSON: ',data)
		if(data.items) items=data.items || {}
		if(data.orderedItemIds) orderedItemIds=data.orderedItemIds || []
		if(data.items){
			for(i in items){
				this.dispatchEvent({type:'itemAdded',item:items[i]})
			}
		}
	}

	if(this.saveToPreference!=null){
		this.load();
	}


}

// MediaList