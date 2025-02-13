import React from 'react';
import { X } from 'lucide-react';
import { IOSInstallInstructions } from './IOSInstallInstructions';

export const InstallPrompt = ({ isOpen, onClose, deferredPrompt }) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    const handleInstall = async () => {
        if (deferredPrompt) {
            try {
                await deferredPrompt.prompt();
                const result = await deferredPrompt.userChoice;
                if (result.outcome === 'accepted') {
                    onClose();
                }
            } catch (error) {
                console.error('Installation failed:', error);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Install App</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {isIOS ? (
                    <IOSInstallInstructions />
                ) : (
                    <div className="space-y-4">
                        <p className="text-gray-600">Click below to install the app:</p>
                        <button
                            onClick={handleInstall}
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