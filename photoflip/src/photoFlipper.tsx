import React, { useState, useEffect, useRef } from 'react';
import { DualImageLoader } from './imageLoader';
import { useInteraction } from './useInteraction';
import './App.css';


function PhotoFlipper()
{
    const [imgSrc, setImgSrc] = useState("/api/image/highRes?id=img-0");

    const isInteracting = useInteraction();
    const [count, setCount] = useState(0);

    const maxImages = 220;
    const imageLoader = useRef<DualImageLoader | null>(null);
    if (imageLoader.current === null)
        imageLoader.current = new DualImageLoader(maxImages);

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
            <img src={imgSrc} alt="photoKnife" style={imgStyle} />
        </header>
    );
}

const imgStyle = {
    maxWidth: "90%",
    maxHeight: "85vh",
    margin: "0 10%",
};

export default PhotoFlipper;
