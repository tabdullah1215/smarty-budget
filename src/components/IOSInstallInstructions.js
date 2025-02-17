export const IOSInstallInstructions = () => {
    return (
        <div className="space-y-6">
            <p className="text-gray-600 font-medium">3 Easy Steps to Install on Your iPhone:</p>
            <ol className="text-left space-y-8 pl-5 list-none text-gray-600">
                <li className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">1</span>
                        </div>
                        <div>
                            <p>Tap the share button on your browser</p>
                            <p className="text-sm text-gray-500 mt-1">Look for the square with arrow pointing up</p>
                        </div>
                    </div>
                    <img
                        src="/images/ios-share-button.png"
                        alt="iOS Share Button"
                        className="rounded-lg border border-gray-200 shadow-sm max-w-[200px]"
                    />
                </li>
                <li className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">2</span>
                        </div>
                        <div>
                            <p>Scroll down and tap "Add to Home Screen"</p>
                            <p className="text-sm text-gray-500 mt-1">You might need to scroll down to find this option</p>
                        </div>
                    </div>
                    <img
                        src="/images/ios-add-to-home.png"
                        alt="Add to Home Screen option"
                        className="rounded-lg border border-gray-200 shadow-sm max-w-[200px]"
                    />
                </li>
                <li className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">3</span>
                        </div>
                        <div>
                            <p>Tap "Add" in the top right corner</p>
                            <p className="text-sm text-gray-500 mt-1">You can customize the app name before adding</p>
                        </div>
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