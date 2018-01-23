let server = null;
server = "http://" + window.location.hostname + ":8088/janus";

let janus = null;
let streaming = null;
const opaqueId = "streamingtest-"+Janus.randomString(12);

function setupJanus() {
  // Initialize the library (all console debuggers enabled)
  Janus.init({debug: "all", callback: function() {
    // Make sure the browser supports WebRTC
    if(!Janus.isWebrtcSupported()) {
      alert("No WebRTC support... ");
      return;
    }
    // Create session
    janus = new Janus(
      {
        server: server,
        success: function() {
          // Attach to streaming plugin
          janus.attach(
            {
              plugin: "janus.plugin.streaming",
              opaqueId: opaqueId,
              success: function(pluginHandle) {
                streaming = pluginHandle;
                Janus.log("Plugin attached! (" + streaming.getPlugin() + ", id=" + streaming.getId() + ")");
                startStream();
              },
              error: function(error) {
                Janus.error("  -- Error attaching plugin... ", error);
                alert("Error attaching plugin... " + error);
              },
              onmessage: function(msg, jsep) {
                Janus.debug(" ::: Got a message :::");
                Janus.debug(msg);
                const result = msg["result"];
                if(result !== null && result !== undefined) {
                  if(result["status"] === 'stopped')
                    stopStream();
                } else if(msg["error"] !== undefined && msg["error"] !== null) {
                  alert(msg["error"]);
                  stopStream();
                  return;
                }
                if(jsep !== undefined && jsep !== null) {
                  Janus.debug("Handling SDP as well...");
                  Janus.debug(jsep);
                  // Offer from the plugin, let's answer
                  streaming.createAnswer(
                    {
                      jsep: jsep,
                      media: { audioSend: false, videoSend: false },  // We want recvonly audio/video
                      success: function(jsep) {
                        Janus.debug("Got SDP!");
                        Janus.debug(jsep);
                        const body = { "request": "start" };
                        streaming.send({"message": body, "jsep": jsep});
                      },
                      error: function(error) {
                        Janus.error("WebRTC error:", error);
                        alert("WebRTC error... " + JSON.stringify(error));
                      }
                    });
                }
              },
              onremotestream: (stream) => {
                Janus.debug(" ::: Got a remote stream :::");
                Janus.debug(stream);
                $("#audio-stream").bind("playing", () => {
                  console.log('Audio Playing!');
                });
                Janus.attachMediaStream($('#audio-stream').get(0), stream);
              },
              oncleanup: function() {
                Janus.log(" ::: Got a cleanup notification :::");
              }
            });
        },
        error: function(error) {
          Janus.error(error);
        },
        destroyed: function() {
        }
    });
  }});
}

function updateStreamsList() {
  const body = { "request": "list" };
  Janus.debug("Sending message (" + JSON.stringify(body) + ")");
  streaming.send({"message": body, success: function(result) {
    if(result === null || result === undefined) {
      alert("Got no response to our query for available streams");
      return;
    }
    if(result["list"] !== undefined && result["list"] !== null) {
      const list = result["list"];
      Janus.log("Got a list of available streams");
      Janus.debug(list);
      for(let mp in list) {
        Janus.debug("  >> [" + list[mp]["id"] + "] " + list[mp]["description"] + " (" + list[mp]["type"] + ")");
      }
    }
  }});
}

function startStream() {
  let body = { "request": "watch", id: 1 };
  streaming.send({"message": body});
}

function stopStream() {
  const body = { "request": "stop" };
  streaming.send({"message": body});
  streaming.hangup();
}

$(document).ready(setupJanus);
