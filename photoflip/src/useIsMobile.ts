import React, { useState, useEffect } from 'react';

/**
 *  Returns true if the user is using mobile (or just has a small
 *  screen)
 */
export const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(!window.matchMedia("(min-width: 768px)").matches);

    useEffect(() => {
        window.matchMedia("(min-width: 768px)")
              .addEventListener('change', e => setIsMobile( !e.matches ));
    }, []);

    return isMobile;
}