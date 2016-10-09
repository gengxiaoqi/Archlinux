/*! Copyright 2009-2016 Evernote Corporation. All rights reserved. */
"undefined"!=typeof KeyboardEvent&&(KeyboardEvent.prototype.getKeyIdentifier=function(){return this.keyIdentifier||this.key});