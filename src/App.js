import React, { useEffect, useState } from "react";
import styled from "styled-components";

import Stream from "./Stream";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
`;

const generateColor = () => {
  const saturation = parseInt(Math.random() * 100);
  return `hsla(216, ${saturation}%, 50%, 1)`;
};

function App() {
  const [streams, setStreams] = useState([]);
  useEffect(() => {
    const getStreams = async () => {
      const response = await fetch(
        `http://${window.location.hostname}:8083/streams`
      );
      const data = await response.json();
      const availableStreamIds = data.map((d) => d.name);
      setStreams(availableStreamIds);
    };
    getStreams();
  }, []);
  return (
    <Wrapper>
      {streams.map((stream) => {
        const background = generateColor();
        return (
          <Stream
            key={`stream-${stream}`}
            streamId={stream}
            background={background}
          />
        );
      })}
    </Wrapper>
  );
}

export default App;
