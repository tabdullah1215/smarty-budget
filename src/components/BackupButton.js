import React, { useState } from 'react';
import { Save, Loader2, AlertTriangle, Download, X } from 'lucide-react';
import { withMinimumDelay } from '../utils/withDelay';
import backupService, { STATIC_BACKUP_FILENAME } from '../services/backupService';
import { useToast } from '../contexts/ToastContext';
import { useTransition, animated } from '@react-spring/web';
import { modalTransitions, backdropTransitions } from '../utils/transitions';

const BackupButton = () => {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [backupInfo, setBackupInfo] = useState(null);
    const { showToast } = useToast();
    const [isCancelling, setIsCancelling] = useState(false);

    const transitions = useTransition(showBackupModal, modalTransitions);
    const backdropTransition = useTransition(showBackupModal, backdropTransitions);

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
        setIsCancelling(true);

        // Give visual feedback before closing
        withMinimumDelay(async () => {
            if (backupInfo) {
                // Clean up the blob URL
                backupInfo.revokeUrl();
            }
            setShowBackupModal(false);
            setBackupInfo(null);
            setIsCancelling(false);
        }, 800);
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
                            onClick={() => !isCancelling && handleClose()}
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
                                        disabled={isCancelling}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200 disabled:opacity-50"
                                    >
                                        {isCancelling ?
                                            <Loader2 className="h-6 w-6 animate-spin" /> :
                                            <X className="h-6 w-6" />
                                        }
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-start">
                                        <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3 mt-0.5" />
                                        <p className="text-gray-600 text-sm">
                                            Your backup file is ready. Tap the button below to download it.
                                            <strong> Make sure to remember where it's saved</strong> so you
                                            can find it if you need to restore later.
                                        </p>
                                    </div>
                                </div>

                                {/* IMPORTANT: This is a real, user-tappable download link */}
                                <a
                                    href={backupInfo.url}
                                    download={backupInfo.filename}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600
                                    text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                    onClick={() => {
                                        localStorage.setItem('lastBackupDate', new Date().toISOString());
                                        showToast('success', 'Backup file download started');
                                        // Don't close modal immediately to ensure download starts
                                        setTimeout(() => {
                                            const downloadPath = backupService.getEstimatedDownloadPath();
                                            showToast('info', `Check ${downloadPath} for your backup file`);
                                            handleClose();
                                        }, 1500);
                                    }}
                                >
                                    <Download className="h-5 w-5 mr-2" />
                                    TAP HERE TO DOWNLOAD
                                </a>

                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <p className="text-xs text-blue-800">
                                        <strong>Troubleshooting:</strong> If nothing happens when you tap the button above,
                                        try pressing and holding it, then select "Download link" or "Save link".
                                    </p>
                                </div>

                                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                    <p className="text-xs text-gray-700">
                                        <strong>Where to find your download:</strong> Check your device's
                                        Downloads folder, or open your browser settings and look for
                                        the Downloads option.
                                    </p>
                                </div>
                            </div>
                        </animated.div>
                    )
            )}
        </>
    );
};

export default BackupButton;