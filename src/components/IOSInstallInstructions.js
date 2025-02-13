// IOSInstallInstructions.js
import React from 'react';

export const IOSInstallInstructions = () => {
    return (
        <div className="space-y-6">
            <p className="text-gray-600">To install on your iPhone:</p>
            <ol className="text-left space-y-8 pl-5 list-decimal text-gray-600">
                <li className="flex flex-col space-y-3">
                    <div>
                        <p>Tap the Share button <span
                            className="inline-block px-2 py-1 bg-gray-100 rounded">⬆️</span> in Safari</p>
                        <p className="text-sm text-gray-500 mt-1">Look for it at the bottom center (newer iOS) or top
                            right (older iOS) of your screen</p>
                    </div>
                    <img
                        src="/images/ios-share-button.png"
                        alt="iOS Share Button"
                        className="rounded-lg border border-gray-200 shadow-sm max-w-[200px]"
                    />
                </li>
                <li className="flex flex-col space-y-3">
                    <div>
                        <p>Scroll down and tap "Add to Home Screen"</p>
                        <p className="text-sm text-gray-500 mt-1">You might need to scroll down to find this option</p>
                    </div>
                    <img
                        src="/images/ios-add-to-home.png"
                        alt="Add to Home Screen option"
                        className="rounded-lg border border-gray-200 shadow-sm max-w-[200px]"
                    />
                </li>
                <li className="flex flex-col space-y-3">
                    <div>
                        <p>Tap "Add" in the top right corner</p>
                        <p className="text-sm text-gray-500 mt-1">You can customize the app name before adding</p>
                    </div>
                    <img
                        src="/images/ios-add-confirm.png"
                        alt="Confirm Add to Home Screen"
                        className="rounded-lg border border-gray-200 shadow-sm max-w-[200px]"
                    />
                </li>
            </ol>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-blue-700">
                    After installation is complete, exit your browser and look for the app icon on your home screen to open
                    the app.
                </p>
            </div>
        </div>
    );
};