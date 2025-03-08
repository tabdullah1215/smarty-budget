import React, { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, HelpCircle, Search, Copy, Check } from 'lucide-react';
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
            }, 2000);

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
                if (onRestore) onRestore();
                handleRestoreSuccess();
            }, 2000);
        } catch (error) {
            console.error('Restore failed:', error);
            showToast('error', error.message || 'Failed to restore from backup');
        } finally {
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

    // Add reload functionality after restore
    const handleRestoreSuccess = () => {
        // Show a success animation for 1 second before reloading
        setIsRestoring(true);
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    const toggleHelp = () => {
        setShowHelp(!showHelp);
    };

    // Modified to copy base filename without extension
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(baseFilename);
            setCopied(true);
            showToast('success', 'Base filename copied to clipboard! Use this to search for your backup file.');
        } catch (err) {
            console.error('Failed to copy: ', err);
            showToast('error', 'Failed to copy to clipboard');
        }
    };

    // Get the estimated download path for instructions
    const downloadPath = backupService.getEstimatedDownloadPath();

    return (
        <div className="w-full my-4">
            <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
            />

            <div className="mb-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-start">
                    <HelpCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="w-full">
                        <h4 className="text-blue-700 font-medium text-sm">Restore from Backup</h4>
                        <p className="text-blue-600 text-xs mt-1">
                            To restore your data, click the copy button:
                        </p>
                        <div className="flex items-center mt-1 bg-white rounded-md p-1.5 border border-blue-100">
                            <p className="text-blue-800 font-semibold text-sm mr-2 flex-grow">
                                {STATIC_BACKUP_FILENAME}
                            </p>
                            <button
                                onClick={copyToClipboard}
                                className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-100 transition-colors duration-200"
                                title="Copy base filename (without .json) to clipboard for searching"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <p className="text-blue-600 text-xs mt-1.5">
                            Then click the Restore button below <br/> and search for the file in <br/> {downloadPath}
                        </p>
                        <p className="hidden text-xs text-blue-700 mt-1">
                            <span className="font-medium">Search tip:</span> Click the copy button to get "{baseFilename}" for searching files like "{baseFilename}(1).json"
                        </p>
                    </div>
                </div>
            </div>

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
                    className="underline text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                    {showHelp ? "Hide help" : "Need help finding your backup?"}
                </button>
            </div>

            {showHelp && (
                <div className="mt-2 p-2 text-xs text-gray-600 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-center mb-1">
                        <Search className="h-3 w-3 text-blue-500 mr-1" />
                        <span className="text-blue-700 font-medium">Quick Steps:</span>
                    </div>
                    <ol className="list-decimal pl-4 space-y-0.5 mb-1.5">
                        <li>Click copy button to get the search term "{baseFilename}"</li>
                        <li>Open your device's search or file manager</li>
                        <li>Search for "{baseFilename}" to find files like:
                            <ul className="list-disc pl-4 mt-0.5 text-gray-500">
                                <li>{STATIC_BACKUP_FILENAME}</li>
                                <li>{baseFilename}(1).json</li>
                                <li>{baseFilename}(2).json</li>
                            </ul>
                        </li>
                        <li>Select any file that matches the pattern</li>
                    </ol>
                    <p className="text-xs text-gray-500 mb-1">Common locations:</p>
                    <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-gray-600 text-xs">
                        <div><span className="font-medium">Windows:</span> Downloads folder</div>
                        <div><span className="font-medium">Mac:</span> ~/Downloads</div>
                        <div><span className="font-medium">iOS:</span> Files app > Downloads</div>
                        <div><span className="font-medium">Android:</span> Downloads folder</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaticRestoreButton;