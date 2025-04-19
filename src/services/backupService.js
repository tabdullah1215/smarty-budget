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
            const businessBudgets = await indexdbService.getBusinessBudgetsByEmail(userEmail);
            const paycheckCategories = await indexdbService.getPaycheckCategories();
            const businessCategories = await indexdbService.getBusinessCategories();

            // Skip backup if no meaningful data
            if (budgets.length === 0 && paycheckBudgets.length === 0 && businessBudgets.length === 0) {
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
                        businessBudgetsCount: businessBudgets.length,
                        paycheckCategoriesCount: paycheckCategories.length,
                        businessCategoriesCount: businessCategories.length
                    }
                },
                data: {
                    budgets,
                    paycheckBudgets,
                    businessBudgets,
                    paycheckCategories,
                    businessCategories
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

    async hasExistingData(budgetType) {
        const userEmail = authService.getUserInfo()?.sub;
        if (!userEmail) return false;

        try {
            if (!budgetType) {
                // Check all budget types
                const budgets = await indexdbService.getBudgetsByEmail(userEmail);
                const paycheckBudgets = await indexdbService.getPaycheckBudgetsByEmail(userEmail);
                const businessBudgets = await indexdbService.getBusinessBudgetsByEmail(userEmail);
                return budgets.length > 0 || paycheckBudgets.length > 0 || businessBudgets.length > 0;
            } else if (budgetType === 'paycheck') {
                // Check only paycheck budgets
                const paycheckBudgets = await indexdbService.getPaycheckBudgetsByEmail(userEmail);
                return paycheckBudgets.length > 0;
            } else if (budgetType === 'business') {
                // Check only business budgets
                const businessBudgets = await indexdbService.getBusinessBudgetsByEmail(userEmail);
                return businessBudgets.length > 0;
            } else if (budgetType === 'custom') {
                // Check only custom budgets
                const budgets = await indexdbService.getBudgetsByEmail(userEmail);
                return budgets.length > 0;
            }

            return false;
        } catch (error) {
            console.error('Error checking for existing data:', error);
            return false;
        }
    },

    async importFromFile(file, budgetType = null) {
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

                    // Check if the user has existing data for the specified budget type
                    const hasData = await this.hasExistingData(budgetType);
                    if (hasData) {
                        throw new Error(`Cannot restore: You already have ${budgetType ? budgetType : ''} data in your account`);
                    }

                    // Track what was restored
                    const result = {
                        success: true,
                        timestamp: backup.metadata.timestamp,
                        budgetsRestored: 0,
                        paycheckBudgetsRestored: 0,
                        businessBudgetsRestored: 0
                    };

                    // Process the import based on the budget type
                    try {
                        // If no specific budget type is provided or 'custom', restore custom budgets
                        if (!budgetType || budgetType === 'custom') {
                            if (backup.data.budgets && backup.data.budgets.length > 0) {
                                for (const budget of backup.data.budgets) {
                                    await indexdbService.addBudget({...budget, userEmail});
                                    result.budgetsRestored++;
                                }
                            }
                        }

                        // If no specific budget type is provided or 'paycheck', restore paycheck budgets
                        if (!budgetType || budgetType === 'paycheck') {
                            if (backup.data.paycheckBudgets && backup.data.paycheckBudgets.length > 0) {
                                for (const budget of backup.data.paycheckBudgets) {
                                    await indexdbService.addPaycheckBudget({...budget, userEmail});
                                    result.paycheckBudgetsRestored++;
                                }
                            }

                            // Import paycheck categories if restoring paycheck data
                            if (backup.data.paycheckCategories && backup.data.paycheckCategories.length > 0) {
                                const existingCategories = await indexdbService.getPaycheckCategories();
                                for (const category of backup.data.paycheckCategories) {
                                    if (!existingCategories.some(c => c.name === category.name)) {
                                        await indexdbService.addPaycheckCategory(category);
                                    }
                                }
                            }
                        }

                        // If no specific budget type is provided or 'business', restore business budgets
                        if (!budgetType || budgetType === 'business') {
                            if (backup.data.businessBudgets && backup.data.businessBudgets.length > 0) {
                                for (const budget of backup.data.businessBudgets) {
                                    await indexdbService.addBusinessBudget({...budget, userEmail});
                                    result.businessBudgetsRestored++;
                                }
                            }

                            // Import business categories if restoring business data
                            if (backup.data.businessCategories && backup.data.businessCategories.length > 0) {
                                const existingCategories = await indexdbService.getBusinessCategories();
                                for (const category of backup.data.businessCategories) {
                                    if (!existingCategories.some(c => c.name === category.name)) {
                                        await indexdbService.addBusinessCategory(category);
                                    }
                                }
                            }
                        }

                        resolve(result);
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