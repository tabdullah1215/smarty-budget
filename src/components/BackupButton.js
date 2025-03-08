import React, { useState } from 'react';
import { Save, Loader2, AlertTriangle } from 'lucide-react';
import { withMinimumDelay } from '../utils/withDelay';
import backupService, { STATIC_BACKUP_FILENAME } from '../services/backupService';
import { useToast } from '../contexts/ToastContext';
import { useTransition, animated } from '@react-spring/web';
import { modalTransitions, backdropTransitions } from '../utils/transitions';

const BackupButton = () => {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [isCreatingBackup, setIsCreatingBackup] = useState(false);
    const { showToast } = useToast();

    const [isCancelling, setIsCancelling] = useState(false);

    const transitions = useTransition(showWarning, modalTransitions);
    const backdropTransition = useTransition(showWarning, backdropTransitions);

    const handleBackup = async () => {
        if (isBackingUp) return;

        // Start the animation on the main button first
        setIsBackingUp(true);

        // Show the spinning icon for a moment before showing the modal
        await withMinimumDelay(async () => {}, 800);

        // Show the modal and stop the spinning icon
        setIsBackingUp(false);
        setShowWarning(true);
    };

    const handleCancel = async () => {
        setIsCancelling(true);

        await withMinimumDelay(async () => {}, 800);

        setShowWarning(false);
        setIsCancelling(false);
    };

    const executeBackup = async () => {
        // Start the creation animation immediately
        setIsCreatingBackup(true);

        // Keep the modal visible briefly so user can see the button animation start
        await withMinimumDelay(async () => {}, 1000);

        // Close the modal but keep the creation state active
        setShowWarning(false);

        // Show the main backup button spinner
        setIsBackingUp(true);

        try {
            // Use a longer delay to make sure the animation is visible
            await withMinimumDelay(async () => {
                await backupService.downloadBackup();

                const downloadPath = backupService.getEstimatedDownloadPath();
                showToast(
                    'success',
                    `Backup saved as "${STATIC_BACKUP_FILENAME}" in your ${downloadPath}`
                );
            }, 4000); // Increased to 4 seconds for better visibility
        } catch (error) {
            console.error('Backup failed:', error);
            showToast('error', error.message || 'Failed to create backup');
        } finally {
            setIsBackingUp(false);
            setIsCreatingBackup(false);
        }
    };

    return (
        <>
            <button
                onClick={handleBackup}
                disabled={isBackingUp || isCreatingBackup}
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

            {/* Overwrite Warning Modal */}
            {backdropTransition((style, item) =>
                    item && (
                        <animated.div
                            style={style}
                            className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50"
                            onClick={() => !isCreatingBackup && !isCancelling && handleCancel()}
                        />
                    )
            )}
            {transitions((style, item) =>
                item && (
                    <animated.div
                        style={style}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                                <div className="flex items-start mb-4">
                                    <div className="flex-shrink-0 mr-3">
                                        <AlertTriangle className="h-6 w-6 text-orange-500" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Backup Notice
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-2">
                                            This will create a backup file named <br/> <strong>{STATIC_BACKUP_FILENAME}</strong>.
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            If prompted, please select "Replace" or "Yes" to save your current data.
                                        </p>
                                        <p className="hidden text-sm text-gray-500 mt-2">
                                            Remember the location where your file is saved, as you'll need it for any future restores.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between space-x-3 mt-5">
                                    <button
                                        onClick={handleCancel}
                                        disabled={isCreatingBackup || isCancelling}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isCancelling ? (
                                            <>
                                                <Loader2 className="h-5 w-5 mr-2 animate-spin"/>
                                                Cancelling...
                                            </>
                                        ) : (
                                            "Cancel"
                                        )}
                                    </button>
                                    <button
                                        onClick={executeBackup}
                                        disabled={isCreatingBackup || isCancelling}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isCreatingBackup ? (
                                            <>
                                                <Loader2 className="h-5 w-5 mr-2 animate-spin"/>
                                                Creating...
                                            </>
                                        ) : (
                                            "Create Backup"
                                        )}
                                    </button>
                                </div>
                            </div>
                    </animated.div>
                    )
            )}
        </>
    );
};

export default BackupButton;