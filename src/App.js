import React, { useRef, useEffect, useState } from "react";

function App() {
  const videoRef = useRef(null);

  const [iceConnectionState, setIceConnectionState] = useState(null);
  const [iceConnectionStateChange, setIceConnectionStateChange] = useState(
    null
  );

  useEffect(() => {
    const peerConnection = new RTCPeerConnection();

    peerConnection.onconnectionstatechange = (e) => {
      // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onconnectionstatechange
      // console.log("connection state changed", peerConnection.connectionState);
      setIceConnectionStateChange(peerConnection.connectionState);
    };

    peerConnection.oniceconnectionstatechange = (e) => {
      // console.log("ice connection state", peerConnection.iceConnectionState);
      // console.log(peerConnection.iceConnectionState);
      setIceConnectionState(peerConnection.iceConnectionState);
    };

    peerConnection.onicecandidateerror = (event) => {
      console.log("on ice candidate error");
    };

    peerConnection.ontrack = function (event) {
      console.log("ontrack");
      // var el = document.createElement(event.track.kind);
      const el = videoRef.current;
      el.srcObject = event.streams[0];
      el.muted = true;
      el.autoplay = true;
      el.controls = false;
      // el.width = 600;
      // document.getElementById("remoteVideos").appendChild(el);
    };

    peerConnection.onicecandidate = async (event) => {
      console.log("onicecandidate");
      if (event.candidate === null) {
        const response = await fetch(
          `http://${window.location.hostname}:8083/recieve`,
          {
            method: "POST",
            body: JSON.stringify({
              suuid: "webcam",
              data: btoa(peerConnection.localDescription.sdp),
            }),
          }
        );
        const data = await response.json();

        try {
          peerConnection.setRemoteDescription(
            new RTCSessionDescription({ type: "answer", sdp: atob(data.data) })
          );
        } catch (error) {
          console.log(error);
        }
      }
    };

    /////////////////////////////////
    // Let's get the show on the road
    /////////////////////////////////
    try {
      peerConnection
        .createOffer({ offerToReceiveAudio: false, offerToReceiveVideo: true })
        .then((localDescription) =>
          peerConnection.setLocalDescription(localDescription)
        );
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <div>
      <p>ice connection state: {iceConnectionState}</p>
      <p>ice connection state change: {iceConnectionStateChange}</p>
      <video ref={videoRef} />
    </div>
  );
}

export default App;
