// src/utils/transitions.js
import { config } from '@react-spring/web';

export const modalTransitions = {
    from: {
        opacity: 0,
        transform: 'translate3d(0,20px,0) scale(0.95)'
    },
    enter: {
        opacity: 1,
        transform: 'translate3d(0,0px,0) scale(1)',
        config: {
            duration: 300 // Slow down the fade-in
        }
    },
    leave: {
        opacity: 0,
        transform: 'translate3d(0,20px,0) scale(0.95)',
        config: {
            duration: 300 // Keep the fade-out faster
        }
    }
};

export const backdropTransitions = {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: {
        duration: 800 // Slow down the backdrop fade-in
    }
};