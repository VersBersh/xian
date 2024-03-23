import React, { useState, useEffect, useRef } from 'react';
import { DualImageLoader } from './imageLoader';
import { useInteraction } from './useInteraction';
import './App.css';


function PhotoFlipper()
{
    const [hasLoaded, setHasLoaded] = useState(false);
    const imgSrc = useRef<string>("");

    const imageLoader = useRef<DualImageLoader|null>(null);
    useEffect(() =>
    {
        imageLoader.current = new DualImageLoader();
        imageLoader.current
                   .LoadFirstImage()
                   .then(src => {
                        imgSrc.current = src;
                        setHasLoaded(true);
                    })
                   .catch(console.warn);
    }, []);

    const isInteracting = useInteraction();
    const isInteractingRef = useRef(isInteracting);
    isInteractingRef.current = isInteracting;

    const flip = () => {
        const img = document.querySelector('#main-img') as HTMLImageElement;
        if (!img)
            return;

        if (!isInteractingRef.current)
        {
            const next = imageLoader.current!.GetNextHighRes();
            if (next === null) return;
            img.src = next;
            return;
        }

        setTimeout(() => {
            const next = imageLoader.current!.GetNextLowRes();
            if (next === null) return;
            img.src = next;
            window.requestAnimationFrame(flip);
        }, 25);
    }

    useEffect(() =>
    {
        if (isInteracting)
            window.requestAnimationFrame(flip);
    }, [isInteracting]);

    return (
        <header id="flipper" className="image-container">
            {hasLoaded && <img src={imgSrc.current} id="main-img" alt="photoKnife" />}
        </header>
    );
}

export default PhotoFlipper;
