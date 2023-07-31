import React, { useMemo } from 'react';
import PhotoFlipper from './photoFlipper';
import { useIsMobile } from './useIsMobile';
import './App.css';

function App()
{
  const isMobile = useIsMobile();

  // prevent the context menu appearing on long click
  useMemo(() => {
    window.oncontextmenu = function(event) {
      event.preventDefault();
      event.stopPropagation();
      const elem = document.getElementById("flipper");
      const md = new Event('mousedown');
      if (elem !== null)
        elem.dispatchEvent(md);
      const mu = new Event('mouseup');
      if (elem !== null)
        elem.dispatchEvent(mu);
      return false;
    }
  }, []);

  return (
    <div className="App">
      <a href="https://c-hasselbusch.de/">
        <div style={isMobile ? titleStyleMobile : titleStyle}>
            <p style={{ margin: "0 0 0 0.1em"}}> — CHRISTIAN H. </p>
            <p style={{ margin: "0 0 0 0.5em"}}>HASSELBUSCH </p>
        </div>
      </a>
      <PhotoFlipper/>
      <a href="https://c-hasselbusch.de/category/contact/"
         style={contactStyle}> CONTACT — </a>
    </div>
  );
}


const titleStyle = {
    fontFamily: "'Helvetica', 'Helvetica Neue'",
    textAlign: "left" as const,
    fontSize: "min(100pt, 12vw)",
    position: "fixed" as const,
    margin: "0.1em 0.1em",
    padding: "0"
};

const titleStyleMobile = {
    ...titleStyle,
    letterSpacing: "-0.04em",
    fontSize: "12vw",
};

const contactStyle = {
    ...titleStyle,
    bottom: 0,
    right: 0,
    textAlign: "right" as const,
    margin: "0.1em 0.2em",
    fontSize: "min(12vw, 100pt)"
}

export default App;
