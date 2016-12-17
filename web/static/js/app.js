// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"

import {Socket} from "phoenix"

let App = {
  init() {
    let socket = new Socket("/socket");
    let editor = new Quill("#editor");
    let docId = $("#editor").data("id");
    let msgContainer = $("#messages");
    let msgInput = $("#message-input");

    socket.connect();

    let docChan = socket.channel("documents:" + docId);

    docChan.on("text_change", ({delta}) => {
      editor.updateContents(delta)
    });

    docChan.on("new_msg", msg => {
      this.appendMessage(msgContainer, msg)
    });

    // push some events
    editor.on("text-change", (delta, oldDelta, source) => {
      if (source !== "user") {
        return;
      } else {
        docChan.push("text_change", {delta: delta});
      }
    });

    msgInput.on("keypress", e => {
      if(e.which !== 13) {
        return;
      } else {
        docChan.push("new_msg", {body: msgInput.val()});
        msgInput.val("");
      }
    });

    docChan.join()
      .receive("ok", resp => console.log("joined!", resp) )
      .receive("error", resp => console.log("error!", resp) )
  },

  appendMessage(msgContainer, msg) {
    msgContainer.append(`<br/>${msg.body}`);
    msgContainer.scrollTop(msgContainer.props("scrollHeight"));
  }
}

App.init()
