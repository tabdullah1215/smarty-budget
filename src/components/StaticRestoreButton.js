import React, { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, HelpCircle, Copy, Check } from 'lucide-react';
import { withMinimumDelay } from '../utils/withDelay';
import backupService, { STATIC_BACKUP_FILENAME } from '../services/backupService';
import { useToast } from '../contexts/ToastContext';
import { useSpring, animated, config } from '@react-spring/web';

const StaticRestoreButton = ({
                                 onRestore,
                                 budgetType,
                                 // Theme colors with sensible defaults based on budget type
                                 primaryColor = budgetType === 'business' ? 'emerald' : 'blue',
                             }) => {
    const [isRestoring, setIsRestoring] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef(null);
    const { showToast } = useToast();

    // Get the base filename without extension for search
    const baseFilename = STATIC_BACKUP_FILENAME.replace('.json', '');

    // Map primary color to appropriate Tailwind color variants
    const colorMap = {
        emerald: {
            text: 'text-emerald-800',
            border: 'border-emerald-200',
            hover: 'hover:bg-emerald-50 hover:border-emerald-300',
            activeButton: 'text-emerald-800',
            helpBg: 'bg-emerald-100',
            helpBorder: 'border-emerald-100',
            helpText: 'text-emerald-900'
        },
        blue: {
            text: 'text-blue-600',
            border: 'border-blue-200',
            hover: 'hover:bg-blue-50 hover:border-blue-300',
            activeButton: 'text-blue-800',
            helpBg: 'bg-blue-100',
            helpBorder: 'border-blue-100',
            helpText: 'text-blue-800'
        }
    };

    // Get the correct color set based on primaryColor
    const colors = colorMap[primaryColor] || colorMap.blue;

    // Help panel animation
    const helpPanelAnimation = useSpring({
        opacity: showHelp ? 1 : 0,
        height: showHelp ? 'auto' : 0,
        transform: showHelp ? 'translateY(0px)' : 'translateY(-30px)',
        config: {
            tension: 120,
            friction: 14,
            duration: 500
        }
    });

    // Help toggle button animation
    const helpToggleAnimation = useSpring({
        scale: showHelp ? 1.12 : 1,
        color: showHelp ? (primaryColor === 'emerald' ? '#047857' : '#2563EB') :
            (primaryColor === 'emerald' ? '#065f46' : '#3B82F6'),
        config: config.wobbly,
    });

    // Restore button animation
    const restoreButtonAnimation = useSpring({
        from: { scale: 0.9, opacity: 0.7 },
        to: { scale: 1, opacity: 1 },
        config: {
            tension: 180,
            friction: 12,
            duration: 700
        }
    });

    // Reset the copied state after 1 second
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
                // Restore only the specified budget type
                const result = await backupService.importFromFile(file, budgetType);

                // Display budget-type specific success message
                const budgetTypeLabel = budgetType === 'business' ? 'business expenses' : 'paycheck budgets';
                const count = budgetType === 'business'
                    ? result.businessBudgetsRestored
                    : result.paycheckBudgetsRestored;

                showToast('success', `Restore successful! ${count} ${budgetTypeLabel} restored.`);

                // CRITICAL: This calls the parent component's function to handle reload
                if (onRestore) {
                    console.log(`Calling parent onRestore callback for ${budgetType}`);
                    onRestore();
                }
            }, 1000);

            // Leave isRestoring as true - the page will reload anyway
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

            <animated.button
                onClick={handleRestoreClick}
                disabled={isRestoring}
                style={{
                    transform: restoreButtonAnimation.scale.to(s => `scale(${s})`),
                    opacity: restoreButtonAnimation.opacity
                }}
                className={`w-full inline-flex items-center justify-center px-4 py-2 ${colors.text} border-2
                    ${colors.border} rounded-md ${colors.hover}
                    transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed`}
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
            </animated.button>

            <div className="mt-2 text-center">
                <animated.button
                    onClick={toggleHelp}
                    disabled={isRestoring}
                    style={{
                        transform: helpToggleAnimation.scale.to(s => `scale(${s})`),
                        color: helpToggleAnimation.color
                    }}
                    className={`underline text-xs hover:${colors.activeButton} hover:underline
                               disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {showHelp ? "Hide help" : "Need help finding your backup?"}
                </animated.button>
            </div>

            <animated.div
                style={helpPanelAnimation}
                className="overflow-hidden"
            >
                <div className="mt-2 p-2 text-xs text-gray-600 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-center mb-1">
                        <HelpCircle className={`h-3 w-3 ${primaryColor === 'emerald' ? 'text-emerald-500' : 'text-blue-500'} mr-1`} />
                        <span className={primaryColor === 'emerald' ? 'text-emerald-800' : 'text-blue-700'}>{" "}
                            <span className="font-medium">Help:</span>
                        </span>
                    </div>

                    <div className={`flex items-center mt-1 mb-2 bg-white rounded-md p-1.5 border ${primaryColor === 'emerald' ? 'border-emerald-100' : 'border-blue-100'}`}>
                        <p className={`${colors.helpText} font-semibold text-sm mr-2 flex-grow`}>
                            {STATIC_BACKUP_FILENAME}
                        </p>
                        <button
                            onClick={copyToClipboard}
                            disabled={isRestoring}
                            className={`${primaryColor === 'emerald' ? 'text-emerald-500 hover:text-emerald-700' : 'text-blue-500 hover:text-blue-700'} p-1 rounded hover:${primaryColor === 'emerald' ? 'bg-emerald-100' : 'bg-blue-100'}
                                       transition-colors duration-200
                                       disabled:opacity-50 disabled:cursor-not-allowed`}
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
                        Copy the filename and use it to search your device.<br/>
                        The file might be saved with a number or date added.<br/>
                        It will be usually saved in the Downloads folder.
                    </p>
                </div>
            </animated.div>
        </div>
    );
};

export default StaticRestoreButton;