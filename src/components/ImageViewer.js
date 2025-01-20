import React, { useState } from 'react';
import { ZoomIn, X, Download, Loader2 } from 'lucide-react';
import { useTransition, animated } from '@react-spring/web';
import { modalTransitions, backdropTransitions } from '../utils/transitions';
import { withMinimumDelay } from '../utils/withDelay';

export const ImageViewer = ({ imageData, fileType = 'image/png', onClose }) => {
    const [show, setShow] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

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

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await withMinimumDelay(async () => {
                const link = document.createElement('a');
                link.href = `data:${fileType};base64,${imageData}`;
                link.download = `receipt-${new Date().toISOString()}.${fileType.split('/')[1]}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            {backdropTransition((style, item) =>
                    item && (
                        <animated.div
                            style={style}
                            className="fixed inset-0 bg-black bg-opacity-75 z-50"
                            onClick={handleClose}
                        />
                    )
            )}
            {transitions((style, item) =>
                    item && (
                        <animated.div
                            style={style}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative max-w-4xl w-full bg-white rounded-lg shadow-2xl">
                                <div className="absolute right-0 top-0 p-4 flex space-x-2">
                                    <button
                                        onClick={handleDownload}
                                        disabled={isDownloading}
                                        className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200
                    bg-white rounded-full shadow-lg hover:bg-gray-100
                    disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDownloading ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            <Download className="h-6 w-6" />
                                        )}
                                    </button>
                                    <button
                                        onClick={handleClose}
                                        disabled={isClosing}
                                        className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200
                    bg-white rounded-full shadow-lg hover:bg-gray-100
                    disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isClosing ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            <X className="h-6 w-6" />
                                        )}
                                    </button>
                                </div>
                                <div className="p-4">
                                    <img
                                        src={`data:${fileType};base64,${imageData}`}
                                        alt="Budget Item"
                                        className="w-full h-auto rounded-lg"
                                    />
                                </div>
                            </div>
                        </animated.div>
                    )
            )}
        </>
    );
};

export default ImageViewer;