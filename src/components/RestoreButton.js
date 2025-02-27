import React, { useState, useRef } from 'react';
import { Upload, Loader2, RefreshCw } from 'lucide-react';
import { withMinimumDelay } from '../utils/withDelay';
import backupService from '../services/backupService';
import { useToast } from '../contexts/ToastContext';

const RestoreButton = ({ onRestore }) => {
    const [isRestoring, setIsRestoring] = useState(false);
    const fileInputRef = useRef(null);
    const { showToast } = useToast();

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

    return (
        <>
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
                className="inline-flex items-center px-4 py-2 text-blue-600 border-2
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
        </>
    );
};

export default RestoreButton;