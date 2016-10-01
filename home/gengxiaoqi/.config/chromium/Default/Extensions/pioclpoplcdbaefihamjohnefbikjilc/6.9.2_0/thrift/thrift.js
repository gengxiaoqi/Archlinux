/*! Copyright 2009-2016 Evernote Corporation. All rights reserved. */
var Thrift={Version:"0.9.0",Type:{STOP:0,VOID:1,BOOL:2,BYTE:3,I08:3,DOUBLE:4,I16:6,I32:8,I64:10,STRING:11,UTF7:11,STRUCT:12,MAP:13,SET:14,LIST:15,UTF8:16,UTF16:17},MessageType:{CALL:1,REPLY:2,EXCEPTION:3},objectLength:function(a){var b=0;for(var c in a)a.hasOwnProperty(c)&&b++;return b},inherits:function(a,b){function c(){}c.prototype=b.prototype,a.prototype=new c}};"undefined"!=typeof global&&(global.Thrift=Thrift),Thrift.TException=function(a){this.message=a},Thrift.inherits(Thrift.TException,Error),Thrift.TException.prototype.name="TException",Thrift.TApplicationExceptionType={UNKNOWN:0,UNKNOWN_METHOD:1,INVALID_MESSAGE_TYPE:2,WRONG_METHOD_NAME:3,BAD_SEQUENCE_ID:4,MISSING_RESULT:5,INTERNAL_ERROR:6,PROTOCOL_ERROR:7},Thrift.TApplicationException=function(a,b){this.message=a,this.code=null===b?0:b},Thrift.inherits(Thrift.TApplicationException,Thrift.TException),Thrift.TApplicationException.prototype.name="TApplicationException",Thrift.TApplicationException.prototype.read=function(a){for(;;){var b=a.readFieldBegin();if(b.ftype==Thrift.Type.STOP)break;var c=b.fid;switch(c){case 1:b.ftype==Thrift.Type.STRING?(b=a.readString(),this.message=b.value):b=a.skip(b.ftype);break;case 2:b.ftype==Thrift.Type.I32?(b=a.readI32(),this.code=b.value):b=a.skip(b.ftype);break;default:b=a.skip(b.ftype)}a.readFieldEnd()}a.readStructEnd()},Thrift.TApplicationException.prototype.write=function(a){a.writeStructBegin("TApplicationException"),this.message&&(a.writeFieldBegin("message",Thrift.Type.STRING,1),a.writeString(this.getMessage()),a.writeFieldEnd()),this.code&&(a.writeFieldBegin("type",Thrift.Type.I32,2),a.writeI32(this.code),a.writeFieldEnd()),a.writeFieldStop(),a.writeStructEnd()},Thrift.TApplicationException.prototype.getCode=function(){return this.code},Thrift.TApplicationException.prototype.getMessage=function(){return this.message},Thrift.Transport=function(a){this.url=a,this.wpos=0,this.rpos=0,this.send_buf="",this.recv_buf=""},Thrift.Transport.prototype={getXmlHttpRequestObject:function(){try{return new XMLHttpRequest}catch(a){}try{return new ActiveXObject("Msxml2.XMLHTTP")}catch(b){}try{return new ActiveXObject("Microsoft.XMLHTTP")}catch(c){}throw"Your browser doesn't support the XmlHttpRequest object."},flush:function(a){if(a||void 0===this.url||""===this.url)return this.send_buf;var b=this.getXmlHttpRequestObject();if(b.overrideMimeType&&b.overrideMimeType("application/json"),b.open("POST",this.url,!1),b.setRequestHeader("Content-Type","application/json"),b.send(this.send_buf),4!=b.readyState)throw"encountered an unknown ajax ready state: "+b.readyState;if(200!=b.status)throw"encountered a unknown request status: "+b.status;this.recv_buf=b.responseText,this.recv_buf_sz=this.recv_buf.length,this.wpos=this.recv_buf.length,this.rpos=0},send:function(a,b,c,d){if("undefined"==typeof jQuery||"undefined"==typeof jQuery.Deferred)throw"Thrift.js requires jQuery 1.5+ to use asynchronous requests";var e=this,f=jQuery.ajax({url:this.url,data:b,type:"POST",cache:!1,dataType:"text thrift",converters:{"text thrift":function(b){e.setRecvBuffer(b);var c=d.call(a);return c}},context:a,success:jQuery.makeArray(c).pop()});return f},setRecvBuffer:function(a){this.recv_buf=a,this.recv_buf_sz=this.recv_buf.length,this.wpos=this.recv_buf.length,this.rpos=0},isOpen:function(){return!0},open:function(){},close:function(){},read:function(a){var b=this.wpos-this.rpos;if(0===b)return"";var c=a;b<a&&(c=b);var d=this.read_buf.substr(this.rpos,c);return this.rpos+=c,d},readAll:function(){return this.recv_buf},write:function(a){this.send_buf=a},getSendBuffer:function(){return this.send_buf}},Thrift.Protocol=function(a){this.transport=a},Thrift.Protocol.Type={},Thrift.Protocol.Type[Thrift.Type.BOOL]='"tf"',Thrift.Protocol.Type[Thrift.Type.BYTE]='"i8"',Thrift.Protocol.Type[Thrift.Type.I16]='"i16"',Thrift.Protocol.Type[Thrift.Type.I32]='"i32"',Thrift.Protocol.Type[Thrift.Type.I64]='"i64"',Thrift.Protocol.Type[Thrift.Type.DOUBLE]='"dbl"',Thrift.Protocol.Type[Thrift.Type.STRUCT]='"rec"',Thrift.Protocol.Type[Thrift.Type.STRING]='"str"',Thrift.Protocol.Type[Thrift.Type.MAP]='"map"',Thrift.Protocol.Type[Thrift.Type.LIST]='"lst"',Thrift.Protocol.Type[Thrift.Type.SET]='"set"',Thrift.Protocol.RType={},Thrift.Protocol.RType.tf=Thrift.Type.BOOL,Thrift.Protocol.RType.i8=Thrift.Type.BYTE,Thrift.Protocol.RType.i16=Thrift.Type.I16,Thrift.Protocol.RType.i32=Thrift.Type.I32,Thrift.Protocol.RType.i64=Thrift.Type.I64,Thrift.Protocol.RType.dbl=Thrift.Type.DOUBLE,Thrift.Protocol.RType.rec=Thrift.Type.STRUCT,Thrift.Protocol.RType.str=Thrift.Type.STRING,Thrift.Protocol.RType.map=Thrift.Type.MAP,Thrift.Protocol.RType.lst=Thrift.Type.LIST,Thrift.Protocol.RType.set=Thrift.Type.SET,Thrift.Protocol.Version=1,Thrift.Protocol.prototype={getTransport:function(){return this.transport},writeMessageBegin:function(a,b,c){this.tstack=[],this.tpos=[],this.tstack.push([Thrift.Protocol.Version,'"'+a+'"',b,c])},writeMessageEnd:function(){var a=this.tstack.pop();this.wobj=this.tstack.pop(),this.wobj.push(a),this.wbuf="["+this.wobj.join(",")+"]",this.transport.write(this.wbuf)},writeStructBegin:function(a){this.tpos.push(this.tstack.length),this.tstack.push({})},writeStructEnd:function(){var a=this.tpos.pop(),b=this.tstack[a],c="{",d=!0;for(var e in b)d?d=!1:c+=",",c+=e+":"+b[e];c+="}",this.tstack[a]=c},writeFieldBegin:function(a,b,c){this.tpos.push(this.tstack.length),this.tstack.push({fieldId:'"'+c+'"',fieldType:Thrift.Protocol.Type[b]})},writeFieldEnd:function(){var a=this.tstack.pop(),b=this.tstack.pop();this.tstack[this.tstack.length-1][b.fieldId]="{"+b.fieldType+":"+a+"}",this.tpos.pop()},writeFieldStop:function(){},writeMapBegin:function(a,b,c){this.tpos.push(this.tstack.length),this.tstack.push([Thrift.Protocol.Type[a],Thrift.Protocol.Type[b],0])},writeMapEnd:function(){var a=this.tpos.pop();if(a!=this.tstack.length){(this.tstack.length-a-1)%2!==0&&this.tstack.push("");var b=(this.tstack.length-a-1)/2;this.tstack[a][this.tstack[a].length-1]=b;for(var c="}",d=!0;this.tstack.length>a+1;){var e=this.tstack.pop(),f=this.tstack.pop();d?d=!1:c=","+c,isNaN(f)||(f='"'+f+'"'),c=f+":"+e+c}c="{"+c,this.tstack[a].push(c),this.tstack[a]="["+this.tstack[a].join(",")+"]"}},writeListBegin:function(a,b){this.tpos.push(this.tstack.length),this.tstack.push([Thrift.Protocol.Type[a],b])},writeListEnd:function(){for(var a=this.tpos.pop();this.tstack.length>a+1;){var b=this.tstack[a+1];this.tstack.splice(a+1,1),this.tstack[a].push(b)}this.tstack[a]="["+this.tstack[a].join(",")+"]"},writeSetBegin:function(a,b){this.tpos.push(this.tstack.length),this.tstack.push([Thrift.Protocol.Type[a],b])},writeSetEnd:function(){for(var a=this.tpos.pop();this.tstack.length>a+1;){var b=this.tstack[a+1];this.tstack.splice(a+1,1),this.tstack[a].push(b)}this.tstack[a]="["+this.tstack[a].join(",")+"]"},writeBool:function(a){this.tstack.push(a?1:0)},writeByte:function(a){this.tstack.push(a)},writeI16:function(a){this.tstack.push(a)},writeI32:function(a){this.tstack.push(a)},writeI64:function(a){this.tstack.push(a)},writeDouble:function(a){this.tstack.push(a)},writeString:function(a){if(null===a)this.tstack.push(null);else{for(var b="",c=0;c<a.length;c++){var d=a.charAt(c);b+='"'===d?'\\"':"\\"===d?"\\\\":"\b"===d?"\\b":"\f"===d?"\\f":"\n"===d?"\\n":"\r"===d?"\\r":"\t"===d?"\\t":d}this.tstack.push('"'+b+'"')}},writeBinary:function(a){this.writeString(a)},readMessageBegin:function(name,messageType,seqid){this.rstack=[],this.rpos=[],"undefined"!=typeof jQuery?this.robj=jQuery.parseJSON(this.transport.readAll()):this.robj=eval(this.transport.readAll());var r={},version=this.robj.shift();if(version!=Thrift.Protocol.Version)throw"Wrong thrift protocol version: "+version;return r.fname=this.robj.shift(),r.mtype=this.robj.shift(),r.rseqid=this.robj.shift(),this.rstack.push(this.robj.shift()),r},readMessageEnd:function(){},readStructBegin:function(a){var b={};return b.fname="",this.rstack[this.rstack.length-1]instanceof Array&&this.rstack.push(this.rstack[this.rstack.length-1].shift()),b},readStructEnd:function(){this.rstack[this.rstack.length-2]instanceof Array&&this.rstack.pop()},readFieldBegin:function(){var a={},b=-1,c=Thrift.Type.STOP;for(var d in this.rstack[this.rstack.length-1])if(null!==d){b=parseInt(d,10),this.rpos.push(this.rstack.length);var e=this.rstack[this.rstack.length-1][b];delete this.rstack[this.rstack.length-1][b],this.rstack.push(e);break}if(b!=-1)for(var f in this.rstack[this.rstack.length-1])null!==Thrift.Protocol.RType[f]&&(c=Thrift.Protocol.RType[f],this.rstack[this.rstack.length-1]=this.rstack[this.rstack.length-1][f]);return a.fname="",a.ftype=c,a.fid=b,a},readFieldEnd:function(){for(var a=this.rpos.pop();this.rstack.length>a;)this.rstack.pop()},readMapBegin:function(a,b,c){var d=this.rstack.pop(),e={};return e.ktype=Thrift.Protocol.RType[d.shift()],e.vtype=Thrift.Protocol.RType[d.shift()],e.size=d.shift(),this.rpos.push(this.rstack.length),this.rstack.push(d.shift()),e},readMapEnd:function(){this.readFieldEnd()},readListBegin:function(a,b){var c=this.rstack[this.rstack.length-1],d={};return d.etype=Thrift.Protocol.RType[c.shift()],d.size=c.shift(),this.rpos.push(this.rstack.length),this.rstack.push(c),d},readListEnd:function(){this.readFieldEnd()},readSetBegin:function(a,b){return this.readListBegin(a,b)},readSetEnd:function(){return this.readListEnd()},readBool:function(){var a=this.readI32();return null!==a&&"1"==a.value?a.value=!0:a.value=!1,a},readByte:function(){return this.readI32()},readI16:function(){return this.readI32()},readI32:function(a){void 0===a&&(a=this.rstack[this.rstack.length-1]);var b={};if(a instanceof Array)0===a.length?b.value=void 0:b.value=a.shift();else if(a instanceof Object){for(var c in a)if(null!==c){this.rstack.push(a[c]),delete a[c],b.value=c;break}}else b.value=a,this.rstack.pop();return b},readI64:function(){return this.readI32()},readDouble:function(){return this.readI32()},readString:function(){var a=this.readI32();return a},readBinary:function(){return this.readString()},skip:function(a){throw"skip not supported yet"}};