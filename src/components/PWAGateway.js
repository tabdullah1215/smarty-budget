import React, { useState, useEffect } from 'react';
import { IOSInstallInstructions } from './IOSInstallInstructions';

const PWAGateway = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    useEffect(() => {
        const handleInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleInstallPrompt);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                <img
                    src="/images/smartyapps-logo.png"
                    alt="SmartyApps.AI Logo"
                    className="h-24 mx-auto mb-6"
                />
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    Install App to Continue
                </h1>

                {isIOS ? (
                    <IOSInstallInstructions />
                ) : (
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Click below to install the app on your device:
                        </p>
                        <button
                            onClick={async () => {
                                if (deferredPrompt) {
                                    await deferredPrompt.prompt();
                                    await deferredPrompt.userChoice;
                                    setDeferredPrompt(null);
                                }
                            }}
                            className="w-full py-3 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                        >
                            Add to Home Screen
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PWAGateway;