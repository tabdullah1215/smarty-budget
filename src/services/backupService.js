// src/services/backupService.js
import { indexdbService } from './IndexDBService';
import { DB_CONFIG } from '../config';
import authService from './authService';

// Define a static backup filename
export const STATIC_BACKUP_FILENAME = 'budget-tracker-backup.json';

export const backupService = {
    async createBackupObject() {
        const userEmail = authService.getUserInfo()?.sub;
        if (!userEmail) throw new Error('User not authenticated');

        try {
            // Get all user data
            const budgets = await indexdbService.getBudgetsByEmail(userEmail);
            const paycheckBudgets = await indexdbService.getPaycheckBudgetsByEmail(userEmail);
            const categories = await indexdbService.getPaycheckCategories();

            // Skip backup if no meaningful data
            if (budgets.length === 0 && paycheckBudgets.length === 0) {
                throw new Error('No budget data to backup');
            }

            return {
                metadata: {
                    version: DB_CONFIG.version,
                    timestamp: new Date().toISOString(),
                    userEmail,
                    summary: {
                        budgetsCount: budgets.length,
                        paycheckBudgetsCount: paycheckBudgets.length,
                        categoriesCount: categories.length
                    }
                },
                data: {
                    budgets,
                    paycheckBudgets,
                    categories
                }
            };
        } catch (error) {
            console.error('Error creating backup object:', error);
            throw error;
        }
    },

    async downloadBackup() {
        try {
            const backup = await this.createBackupObject();

            const blob = new Blob([JSON.stringify(backup)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            // Use static filename instead of date-based
            link.href = url;
            link.download = STATIC_BACKUP_FILENAME;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Record backup time for reminder purposes
            localStorage.setItem('lastBackupDate', new Date().toISOString());

            return backup;
        } catch (error) {
            console.error('Error downloading backup:', error);
            throw error;
        }
    },

    // Get estimated download path based on browser/OS detection
    getEstimatedDownloadPath() {
        const os = this.detectOS();
        const browser = this.detectBrowser();

        let path = "Downloads folder";

        // Estimate download path based on OS and browser
        if (os === 'Windows') {
            path = "Downloads folder (usually C:\\Users\\YourName\\Downloads)";
            if (browser === 'Firefox') {
                path = "Downloads folder or the location you last saved to in Firefox";
            }
        } else if (os === 'Mac') {
            path = "Downloads folder (~/Downloads)";
        } else if (os === 'iOS') {
            path = "Files app > Downloads";
            if (browser === 'Safari') {
                path = "Files app > On My iPhone/iPad > Downloads";
            }
        } else if (os === 'Android') {
            path = "Downloads folder or your file browser app";
            if (browser === 'Chrome') {
                path = "Files app > Downloads";
            }
        }

        return path;
    },

    async prepareBackup() {
        try {
            const backup = await this.createBackupObject();
            const blob = new Blob([JSON.stringify(backup)], {type: 'application/json'});
            const blobUrl = URL.createObjectURL(blob);

            // Return the info needed for download, but don't auto-download
            return {
                url: blobUrl,
                filename: STATIC_BACKUP_FILENAME,
                revokeUrl: () => URL.revokeObjectURL(blobUrl)
            };
        } catch (error) {
            console.error('Error preparing backup:', error);
            throw error;
        }
    },

    // Simple OS detection
    detectOS() {
        const userAgent = window.navigator.userAgent;
        if (userAgent.indexOf("Windows") !== -1) return 'Windows';
        if (userAgent.indexOf("Mac") !== -1) return 'Mac';
        if (userAgent.indexOf("iPhone") !== -1 || userAgent.indexOf("iPad") !== -1) return 'iOS';
        if (userAgent.indexOf("Android") !== -1) return 'Android';
        return 'Unknown';
    },

    // Simple browser detection
    detectBrowser() {
        const userAgent = window.navigator.userAgent;
        if (userAgent.indexOf("Chrome") !== -1) return 'Chrome';
        if (userAgent.indexOf("Firefox") !== -1) return 'Firefox';
        if (userAgent.indexOf("Safari") !== -1) return 'Safari';
        if (userAgent.indexOf("Edge") !== -1) return 'Edge';
        return 'Unknown';
    },

    async hasExistingData() {
        const userEmail = authService.getUserInfo()?.sub;
        if (!userEmail) return false;

        try {
            const budgets = await indexdbService.getBudgetsByEmail(userEmail);
            const paycheckBudgets = await indexdbService.getPaycheckBudgetsByEmail(userEmail);

            return budgets.length > 0 || paycheckBudgets.length > 0;
        } catch (error) {
            console.error('Error checking for existing data:', error);
            return false;
        }
    },

    async importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    const userEmail = authService.getUserInfo()?.sub;

                    // Basic validation
                    if (!backup.metadata || !backup.data) {
                        throw new Error('Invalid backup file format');
                    }

                    if (backup.metadata.userEmail !== userEmail) {
                        throw new Error('This backup belongs to a different user');
                    }

                    // Check if the user has existing data
                    const hasData = await this.hasExistingData();
                    if (hasData) {
                        throw new Error('Cannot restore: You already have data in your account');
                    }

                    // Process the import
                    try {
                        // Import budgets
                        if (backup.data.budgets && backup.data.budgets.length > 0) {
                            for (const budget of backup.data.budgets) {
                                await indexdbService.addBudget({...budget, userEmail});
                            }
                        }

                        // Import paycheck budgets
                        if (backup.data.paycheckBudgets && backup.data.paycheckBudgets.length > 0) {
                            for (const budget of backup.data.paycheckBudgets) {
                                await indexdbService.addPaycheckBudget({...budget, userEmail});
                            }
                        }

                        // Import categories
                        if (backup.data.categories && backup.data.categories.length > 0) {
                            const existingCategories = await indexdbService.getPaycheckCategories();
                            for (const category of backup.data.categories) {
                                if (!existingCategories.some(c => c.name === category.name)) {
                                    await indexdbService.addPaycheckCategory(category);
                                }
                            }
                        }

                        resolve({
                            success: true,
                            timestamp: backup.metadata.timestamp,
                            budgetsRestored: backup.data.budgets?.length || 0,
                            paycheckBudgetsRestored: backup.data.paycheckBudgets?.length || 0
                        });
                    } catch (error) {
                        reject(new Error(`Failed to restore data: ${error.message}`));
                    }
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
};

export default backupService;