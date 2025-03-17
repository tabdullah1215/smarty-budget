import React, { useState, useEffect } from 'react';
import { Save, Loader2, Download, X } from 'lucide-react';
import { withMinimumDelay } from '../utils/withDelay';
import backupService, { STATIC_BACKUP_FILENAME } from '../services/backupService';
import { useToast } from '../contexts/ToastContext';
import { useTransition, animated } from '@react-spring/web';

const BackupButton = () => {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [backupInfo, setBackupInfo] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isClosing, setIsClosing] = useState(false); // Closing animation state
    const { showToast } = useToast();

    // Custom modal transitions with longer duration
    const modalTransitions = {
        from: {
            opacity: 0,
            transform: 'translate3d(0,20px,0) scale(0.95)'
        },
        enter: {
            opacity: 1,
            transform: 'translate3d(0,0px,0) scale(1)',
            config: {
                duration: 300
            }
        },
        leave: {
            opacity: 0,
            transform: 'translate3d(0,20px,0) scale(0.95)',
            config: {
                duration: 800 // Slower fadeout
            }
        }
    };

    // Custom backdrop transitions
    const backdropTransitions = {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0, config: { duration: 800 } } // Match modal duration
    };

    // Use isClosing state to control transitions
    const transitions = useTransition(showBackupModal && !isClosing, modalTransitions);
    const backdropTransition = useTransition(showBackupModal && !isClosing, backdropTransitions);

    // Add effect to handle delayed closing
    useEffect(() => {
        if (isClosing) {
            const timer = setTimeout(() => {
                setShowBackupModal(false);
                setIsClosing(false);

                // Cleanup URL after animation completes
                if (backupInfo) {
                    backupInfo.revokeUrl();
                    setBackupInfo(null);
                }

                // Reset all states
                setIsCancelling(false);
                setIsDownloading(false);
            }, 800); // Match the leave animation duration

            return () => clearTimeout(timer);
        }
    }, [isClosing, backupInfo]);

    const handleBackup = async () => {
        if (isBackingUp) return;

        // Start the animation on the main button
        setIsBackingUp(true);

        try {
            await withMinimumDelay(async () => {
                // Prepare the backup but don't download automatically
                const info = await backupService.prepareBackup();
                setBackupInfo(info);
                setShowBackupModal(true);
            }, 1000);
        } catch (error) {
            console.error('Backup preparation failed:', error);
            showToast('error', error.message || 'Failed to prepare backup');
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleClose = () => {
        // Don't allow closing if already in process
        if (isCancelling || isDownloading || isClosing) return;

        setIsCancelling(true);

        // First set visual state for X button
        withMinimumDelay(async () => {
            // Then trigger the closing animation
            setIsClosing(true);
        }, 300);
    };

    const handleDownload = () => {
        // Don't allow download if already in process
        if (isDownloading || isCancelling || isClosing) return;

        setIsDownloading(true);
        localStorage.setItem('lastBackupDate', new Date().toISOString());
        showToast('success', 'Backup file download started');

        // Show downloading state for a minimum time
        withMinimumDelay(async () => {
            // Then trigger the closing animation
            setIsClosing(true);
        }, 1500);
    };

    return (
        <>
            <button
                onClick={handleBackup}
                disabled={isBackingUp}
                className="inline-flex items-center justify-center p-2
                    text-gray-600 hover:text-gray-900 transition-all duration-300
                    transform hover:scale-110 active:scale-95"
                title="Backup all budget data"
            >
                {isBackingUp ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                    <Save className="h-6 w-6" />
                )}
            </button>

            {/* Download Modal */}
            {backdropTransition((style, item) =>
                    item && (
                        <animated.div
                            style={style}
                            className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50"
                            onClick={() => !isCancelling && !isDownloading && !isClosing && handleClose()}
                        />
                    )
            )}
            {transitions((style, item) =>
                    item && backupInfo && (
                        <animated.div
                            style={style}
                            className="fixed inset-0 flex items-center justify-center z-50 p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Download Backup
                                    </h3>
                                    <button
                                        onClick={handleClose}
                                        disabled={isCancelling || isDownloading || isClosing}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200 disabled:opacity-50"
                                    >
                                        {isCancelling ?
                                            <Loader2 className="h-6 w-6 animate-spin" /> :
                                            <X className="h-6 w-6" />
                                        }
                                    </button>
                                </div>

                                <p className="text-gray-600 text-sm mb-4">
                                    Your backup file is ready. Tap below to download it.
                                </p>

                                {/* IMPORTANT: This is a real, user-tappable download link */}
                                <a
                                    href={backupInfo?.url}
                                    download={backupInfo?.filename}
                                    className={`w-full flex items-center justify-center px-4 py-3 
                                    ${isDownloading ? 'bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'} 
                                    text-white rounded-md transition-colors duration-200
                                    ${(isDownloading) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                    onClick={!isDownloading && !isClosing ? handleDownload : undefined}
                                >
                                    {isDownloading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-5 w-5 mr-2" />
                                            Download Backup
                                        </>
                                    )}
                                </a>
                            </div>
                        </animated.div>
                    )
            )}
        </>
    );
};

export default BackupButton;