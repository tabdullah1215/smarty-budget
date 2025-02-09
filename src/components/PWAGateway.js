// PWAGateway.js
import {useEffect, useState} from "react";

const PWAGateway = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);

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

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`Installation ${outcome}`);
            setDeferredPrompt(null);
        } catch (error) {
            console.error('Error showing install prompt:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                <img
                    src="/images/smartyapps-logo.png"
                    alt="SmartyApps.AI Logo"
                    className="h-24 mx-auto mb-6"
                />
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    Install App to Continue
                </h1>
                <p className="text-gray-600 mb-6">
                    To use this app, add it to your home screen. After installation,
                    you'll find the app icon on your home screen for easy access.
                </p>
                <button
                    onClick={handleInstall}
                    className="w-full py-3 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 flex items-center justify-center"
                >
                    <span>Add to Home Screen</span>
                </button>
            </div>
        </div>
    );
};

export default PWAGateway;