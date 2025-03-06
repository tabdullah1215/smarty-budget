// src/utils/storageEstimation.js

/**
 * Get an estimate of available storage using the Storage Manager API
 * @returns {Promise<{usedMB: number, quotaMB: number, remainingMB: number, percentUsed: number}|null>}
 */
export const getStorageEstimate = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
            const { usage, quota } = await navigator.storage.estimate();

            // Convert to MB for readability
            const usedMB = Math.round(usage / (1024 * 1024));
            const quotaMB = Math.round(quota / (1024 * 1024));
            const remainingMB = Math.round((quota - usage) / (1024 * 1024));
            const percentUsed = Math.round((usage / quota) * 100);

            return {
                usedMB,
                quotaMB,
                remainingMB,
                percentUsed
            };
        } catch (error) {
            console.warn('Error getting storage estimate:', error);
            return null;
        }
    }
    return null;
};

/**
 * Format the storage estimate into a simple message
 * @param {Object} estimate - The storage estimate object
 * @returns {string} A formatted message about storage
 */
export const formatStorageMessage = (estimate) => {
    if (!estimate) return '';

    return `Storage: ${estimate.remainingMB} MB available (${estimate.percentUsed}% used)`;
};