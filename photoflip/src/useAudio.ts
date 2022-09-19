import React, { useState, useEffect } from 'react';


export const useAudio: ((url: any) => [boolean, () => void]) = url => {
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    setPlaying(!playing);
  }

  useEffect(() => {
      playing ? audio.play() : audio.pause();
    },
    [audio, playing]
  );

  useEffect(() => {
    audio.addEventListener('ended', () => setPlaying(false));
    return () => {
      audio.removeEventListener('ended', () => setPlaying(false));
    };
  }, [audio]);

  return [playing, toggle];
};