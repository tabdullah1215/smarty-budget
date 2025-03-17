import React, { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, HelpCircle, Copy, Check } from 'lucide-react';
import { withMinimumDelay } from '../utils/withDelay';
import backupService, { STATIC_BACKUP_FILENAME } from '../services/backupService';
import { useToast } from '../contexts/ToastContext';

const StaticRestoreButton = ({ onRestore }) => {
    const [isRestoring, setIsRestoring] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef(null);
    const { showToast } = useToast();

    // Get the base filename without extension for search
    const baseFilename = STATIC_BACKUP_FILENAME.replace('.json', '');

    // Reset the copied state after 2 seconds
    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => {
                setCopied(false);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [copied]);

    const handleFileSelect = async (e) => {
        if (isRestoring) return;

        const file = e.target.files?.[0];
        if (!file) return;

        setIsRestoring(true);
        try {
            await withMinimumDelay(async () => {
                const result = await backupService.importFromFile(file);
                showToast('success', `Restore successful! ${result.budgetsRestored + result.paycheckBudgetsRestored} budgets restored.`);

                // Call onRestore, which will trigger the fadeout in the parent component
                if (onRestore) onRestore();

                // Don't reload the page here, let the parent component handle it
                // Continue showing the spinner for visual feedback
            }, 1000);

            // Keep showing spinner indefinitely - parent will handle page refresh
        } catch (error) {
            console.error('Restore failed:', error);
            showToast('error', error.message || 'Failed to restore from backup');
            setIsRestoring(false);
            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRestoreClick = () => {
        if (isRestoring) return;
        fileInputRef.current?.click();
    };

    const toggleHelp = () => {
        setShowHelp(!showHelp);
    };

    // Copy filename to clipboard
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(baseFilename);
            setCopied(true);
            showToast('success', 'Filename copied to clipboard! Use this to search for your backup file.');
        } catch (err) {
            console.error('Failed to copy: ', err);
            showToast('error', 'Failed to copy to clipboard');
        }
    };

    return (
        <div className="w-full my-4">
            <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
            />

            <button
                onClick={handleRestoreClick}
                disabled={isRestoring}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-blue-600 border-2
                    border-blue-200 rounded-md hover:bg-blue-50 hover:border-blue-300
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isRestoring ? (
                    <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Restoring...
                    </>
                ) : (
                    <>
                        <Upload className="h-5 w-5 mr-2" />
                        Restore from Backup
                    </>
                )}
            </button>

            <div className="mt-2 text-center">
                <button
                    onClick={toggleHelp}
                    disabled={isRestoring}
                    className="underline text-xs text-blue-600 hover:text-blue-800 hover:underline
                               disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {showHelp ? "Hide help" : "Need help finding your backup?"}
                </button>
            </div>

            {showHelp && (
                <div className="mt-2 p-2 text-xs text-gray-600 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-center mb-1">
                        <HelpCircle className="h-3 w-3 text-blue-500 mr-1" />
                        <span className="text-blue-700 font-medium">Troubleshooting:</span>
                    </div>

                    <div className="flex items-center mt-1 mb-2 bg-white rounded-md p-1.5 border border-blue-100">
                        <p className="text-blue-800 font-semibold text-sm mr-2 flex-grow">
                            {STATIC_BACKUP_FILENAME}
                        </p>
                        <button
                            onClick={copyToClipboard}
                            disabled={isRestoring}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-100
                                       transition-colors duration-200
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Copy filename to clipboard for searching"
                        >
                            {copied ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </button>
                    </div>

                    <p className="text-xs text-gray-600 mb-1">
                        <strong>Tip:</strong> Copy the filename and use it to search your device.
                        The file might be saved with a different name like "{baseFilename}(1).json"
                        or with a date appended. Your device often adds numbers to avoid overwriting
                        existing files.
                    </p>
                </div>
            )}
        </div>
    );
};

export default StaticRestoreButton;