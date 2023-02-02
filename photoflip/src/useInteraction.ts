import React, { useEffect, useState } from 'react';


/**
 *  Return true when the user is interactive with the page
 *  (i.e. clicking or scrolling)
 */
export const useInteraction = (): boolean =>
{
    const delay: number = 800;
    const [isClicking, setIsClicking] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const clickCancellationToken: React.MutableRefObject<ReturnType<typeof setTimeout> | undefined> = React.useRef(undefined);
    const scrollCancellationToken: React.MutableRefObject<ReturnType<typeof setTimeout> | undefined> = React.useRef(undefined);

    // update state to reflect the user holding click
    useEffect(() => {
        const click = (e: any) => {
          setIsClicking(true);
          clearTimeout(clickCancellationToken.current);
        }

        const unclick = (e: any) => {
          clearTimeout(clickCancellationToken.current);
          clickCancellationToken.current = setTimeout(() => setIsClicking(false), delay);
        }

        window.removeEventListener('mousedown', click);
        window.addEventListener('mousedown', click);

        window.removeEventListener('mouseup', unclick);
        window.addEventListener('mouseup', unclick);
        window.removeEventListener('mouseout', unclick);
        window.addEventListener('mouseout', unclick);
        window.removeEventListener('mouseleave', unclick);
        window.addEventListener('mouseleave', unclick);

        window.removeEventListener('touchstart', click);
        window.addEventListener('touchstart', click);

        window.removeEventListener('touchend', unclick);
        window.addEventListener('touchend', unclick);
      }, []);

    // update state to reflect the user scrolling
    useEffect(() => {
        const tick = (e: WheelEvent) => {
            if (Math.abs(e.deltaY) < 5)
              return;
            setIsScrolling(true);
            clearTimeout(scrollCancellationToken.current);
            scrollCancellationToken.current = setTimeout(() => setIsScrolling(false), delay);
        }
        window.removeEventListener('wheel', tick);
        window.addEventListener('wheel', tick, { passive: true });
        return () => window.removeEventListener('wheel', tick);
    }, []);

    return isClicking || isScrolling;
}
