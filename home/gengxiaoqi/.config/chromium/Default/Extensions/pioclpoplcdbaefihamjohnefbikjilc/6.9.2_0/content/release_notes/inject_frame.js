/*! Copyright 2009-2016 Evernote Corporation. All rights reserved. */
function closeReleaseNotes(){releaseNotes&&releaseNotes.parentNode&&(releaseNotes.parentNode.removeChild(releaseNotes),releaseNotesChannel.port1.close())}function msgHandlerReceiveSecret(a,b,c){a["for"]===SHORTCUT_RELEASE_NOTES&&releaseNotes.contentWindow.postMessage({name:"receivePort",secret:a.secret},Browser.extension.getURL(""),[releaseNotesChannel.port2])}Browser.addMessageHandlers({receiveSecret:msgHandlerReceiveSecret,toggleCoordinator:closeReleaseNotes});var releaseNotesChannel=new MessageChannel;releaseNotesChannel.port1.addEventListener("message",function(a){"close"===a.data.name&&closeReleaseNotes()}),releaseNotesChannel.port1.start();var releaseNotes=document.createElement("iframe");releaseNotes.id="evernoteReleaseNotes",releaseNotes.src=Browser.extension.getURL("content/release_notes/shortcuts.html"),document.body.appendChild(releaseNotes);