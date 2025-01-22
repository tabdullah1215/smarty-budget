// src/utils/scrollLock.js

export const disableScroll = () => {
    // Store current scroll position
    const scrollY = window.scrollY;

    // Add styles to body
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    // Store the scroll position as a data attribute
    document.body.dataset.scrollPosition = scrollY;
};

export const enableScroll = () => {
    // Remove styles from body
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';

    // Restore scroll position
    const scrollY = parseInt(document.body.dataset.scrollPosition || '0');
    window.scrollTo(0, scrollY);

    // Clean up data attribute
    delete document.body.dataset.scrollPosition;
};