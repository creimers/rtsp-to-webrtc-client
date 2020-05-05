import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background: ${(props) => props.background};
  color: white;
`;

const StyledVideo = styled.video`
  width: 100%;
`;

const Stream = ({ background, streamId }) => {
  const videoRef = useRef(null);

  const [iceConnectionState, setIceConnectionState] = useState(null);
  const [iceConnectionStateChange, setIceConnectionStateChange] = useState(
    null
  );

  useEffect(() => {
    const peerConnection = new RTCPeerConnection();

    peerConnection.onconnectionstatechange = (e) => {
      // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onconnectionstatechange
      setIceConnectionStateChange(peerConnection.connectionState);
    };

    peerConnection.oniceconnectionstatechange = (e) => {
      setIceConnectionState(peerConnection.iceConnectionState);
    };

    peerConnection.onicecandidateerror = (event) => {
      console.log("on ice candidate error");
    };

    peerConnection.ontrack = function (event) {
      console.log("ontrack");
      const el = videoRef.current;
      el.srcObject = event.streams[0];
      el.muted = true;
      el.autoplay = true;
      el.controls = false;
    };

    peerConnection.onicecandidate = async (event) => {
      console.log("onicecandidate");
      if (event.candidate === null) {
        const response = await fetch(
          `http://${window.location.hostname}:8083/recieve`,
          {
            method: "POST",
            body: JSON.stringify({
              suuid: streamId,
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
  }, [streamId]);

  return (
    <Wrapper background={background}>
      <StyledVideo ref={videoRef} />
      <p>ice connection state: {iceConnectionState}</p>
      <p>ice connection state change: {iceConnectionStateChange}</p>
    </Wrapper>
  );
};

Stream.propTypes = {
  streamId: PropTypes.string.isRequired,
  background: PropTypes.string.isRequired,
};

Stream.defaultProps = {
  background: "yellow",
};

export default Stream;
