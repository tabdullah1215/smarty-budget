import React, { useState } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { X, Loader2 } from 'lucide-react';
import { modalTransitions, backdropTransitions } from '../utils/transitions';
import { withMinimumDelay } from '../utils/withDelay';
import { IOSInstallInstructions } from './IOSInstallInstructions';

export const InstallPrompt = ({ isOpen, onClose, deferredPrompt }) => {
    const [show, setShow] = useState(isOpen);
    const [isClosing, setIsClosing] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    const transitions = useTransition(show, modalTransitions);
    const backdropTransition = useTransition(show, backdropTransitions);

    const handleClose = async () => {
        setIsClosing(true);
        try {
            await withMinimumDelay(async () => {});
            setShow(false);
            await withMinimumDelay(async () => {});
            onClose();
        } finally {
            setIsClosing(false);
        }
    };

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        setIsInstalling(true);
        try {
            await withMinimumDelay(async () => {
                await deferredPrompt.prompt();
                const result = await deferredPrompt.userChoice;
                if (result.outcome === 'accepted') {
                    await handleClose();
                }
            }, 800);
        } catch (error) {
            console.error('Installation failed:', error);
        } finally {
            setIsInstalling(false);
        }
    };


    React.useEffect(() => {
        if (isOpen) {
            setShow(true);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {backdropTransition((style, item) =>
                    item && (
                        <animated.div
                            style={style}
                            className="fixed inset-0 bg-black bg-opacity-50 z-50"
                            onClick={handleClose}
                        />
                    )
            )}
            {transitions((style, item) =>
                    item && (
                        <animated.div
                            style={style}
                            className="fixed inset-0 flex items-start justify-center p-4 z-50 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white rounded-lg p-6 max-w-md w-full my-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Install App</h3>
                                    <button
                                        onClick={handleClose}
                                        disabled={isClosing || isInstalling}
                                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200
                                        disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isClosing ? (
                                            <Loader2 className="h-5 w-5 animate-spin"/>
                                        ) : (
                                            <X className="h-5 w-5"/>
                                        )}
                                    </button>
                                </div>
                                <div className="overflow-y-auto">
                                    {isIOS ? (
                                        <IOSInstallInstructions />
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-gray-600">Click below to install the app:</p>
                                            <button
                                                onClick={handleInstall}
                                                disabled={isInstalling || isClosing}
                                                className="w-full py-3 px-4 bg-blue-500 text-white rounded-md
                                                hover:bg-blue-600 transition duration-300
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                inline-flex items-center justify-center"
                                            >
                                                {isInstalling ? (
                                                    <>
                                                        <Loader2 className="h-5 w-5 mr-2 animate-spin"/>
                                                        Installing...
                                                    </>
                                                ) : (
                                                    'Add to Home Screen'
                                                )}
                                            </button>
                                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                <p className="text-blue-700">
                                                    After installation, look for the app icon on your home screen or in your
                                                    app drawer to open the app.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </animated.div>
                    )
            )}
        </>
    );
};