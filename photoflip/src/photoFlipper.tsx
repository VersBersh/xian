import React, { useState, useEffect, useRef } from 'react';
import { DualImageLoader } from './imageLoader';
import { useInteraction } from './useInteraction';
import './App.css';


function PhotoFlipper()
{
    const [imgSrc, setImgSrc] = useState<string | null>(null);

    const isInteracting = useInteraction();
    const [count, setCount] = useState(0);

    const imageLoader = useRef<DualImageLoader | null>(null);
    if (imageLoader.current === null)
    {
        imageLoader.current = new DualImageLoader();
        imageLoader.current.LoadFirstImage().then(setImgSrc);
    }

    useEffect(() =>
    {
        if (!isInteracting)
        {
            const next = imageLoader.current!.GetNextHighRes();
            if (next === null) return;
            setImgSrc(next);
            return;
        }

        setTimeout(() => {
        const next = imageLoader.current!.GetNextLowRes();
        if (next === null) return;
        setImgSrc(next);
        setCount(count + 1); // force one more re-render (ending on a high res photo)
        }, 25);

    }, [isInteracting, count]);

    return (
        <header className="image-container">
            {imgSrc !== null && <img src={imgSrc!} alt="photoKnife" style={imgStyle} />}
        </header>
    );
}

const imgStyle = {
    maxWidth: "90%",
    maxHeight: "85vh",
    margin: "0 10%",
};

export default PhotoFlipper;
