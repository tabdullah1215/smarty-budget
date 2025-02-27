import React, { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { withMinimumDelay } from '../utils/withDelay';
import backupService from '../services/backupService';
import { useToast } from '../contexts/ToastContext';

const BackupButton = () => {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const { showToast } = useToast();

    const handleBackup = async () => {
        if (isBackingUp) return;

        setIsBackingUp(true);
        try {
            const backupButton = document.querySelector('.backup-icon');
            if (backupButton) {
                backupButton.classList.add('animate-spin');
            }

            await withMinimumDelay(async () => {
                await backupService.downloadBackup();
                showToast('success', 'Backup created successfully');
            }, 2000);
        } catch (error) {
            console.error('Backup failed:', error);
            showToast('error', error.message || 'Failed to create backup');
        } finally {
            setIsBackingUp(false);
            const backupButton = document.querySelector('.backup-icon');
            if (backupButton) {
                backupButton.classList.remove('animate-spin');
            }
        }
    };

    return (
        <button
            onClick={handleBackup}
            disabled={isBackingUp}
            className="inline-flex items-center justify-center p-2
                text-gray-600 hover:text-gray-900 transition-all duration-500
                transform hover:scale-110"
            title="Backup all budget data"
        >
            {isBackingUp ? (
                <Loader2 className="backup-icon h-6 w-6 animate-spin" />
            ) : (
                <Save className="backup-icon h-6 w-6" />
            )}
        </button>
    );
};

export default BackupButton;