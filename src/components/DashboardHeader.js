// src/components/DashboardHeader.js
import React from 'react';

// In DashboardHeader.js, update the layout structure:

// In DashboardHeader.js, update the layout:

// In DashboardHeader.js, update the component:

const DashboardHeader = ({
                             subtitle = "DIGITALPHORM BUDGET TRACKER",
                             title,
                             permanentMessage,
                             logoUrl = "/images/smartyapps-logo.png",
                             centerContent
                         }) => {
    // Determine if this is the login page
    const isLoginPage = subtitle === "Login";

    return (
        <div className={`fixed top-0 left-0 right-0 bg-white z-10 shadow-md 
            ${isLoginPage
            ? 'max-h-[120px] md:min-h-[120px]'  // Reduced height for login page
            : 'max-h-[200px] md:min-h-[120px]'   // Original height for other pages
        }`}>
            <div className="max-w-6xl mx-auto px-4 py-3">
                <div className="relative flex flex-col md:flex-row">
                    {/* Logo Section - Left Aligned */}
                    <div className="absolute left-0 top-0">
                        <img
                            src={logoUrl}
                            alt="SmartyApps.AI Logo"
                            className={`${isLoginPage
                                ? 'h-16 md:h-14'     // Smaller logo for login page
                                : 'h-16 md:h-20'     // Original logo size for other pages
                            }`}
                        />
                    </div>

                    {/* Centered Content Container */}
                    <div className="flex-grow flex flex-col items-center justify-center w-full">
                        {/* Title and Subtitle */}
                        <div className="text-center">
                            <h2 className="text-lg md:text-xl text-gray-600 font-semibold">{subtitle}</h2>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h1>
                            {centerContent && (
                                <div className="mt-2">{centerContent}</div>
                            )}
                        </div>

                        {/* Message Section - Centered */}
                        {permanentMessage && (
                            <div className={`w-full max-w-2xl ${isLoginPage ? 'mt-2' : 'mt-4'}`}>
                                <div
                                    className={`p-2 rounded-lg w-full text-center text-sm 
                                    min-h-[2rem] flex items-center justify-center ${
                                        permanentMessage.content
                                            ? (permanentMessage.type === 'error'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-green-100 text-green-700')
                                            : 'bg-gray-50 text-gray-400'
                                    }`}
                                >
                                    {permanentMessage.content || 'No messages'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default DashboardHeader;