// src/components/InstallPrompt.js
import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import axios from 'axios';
import {API_ENDPOINT, APP_ID} from '../config';
import { useToast } from '../contexts/ToastContext';

export const InstallPrompt = ({ isOpen, onClose, deferredPrompt }) => {
    const [step, setStep] = useState('verify'); // 'verify' | 'install'
    const [email, setEmail] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const { showToast } = useToast();

    const handleVerify = async () => {
        setIsVerifying(true);
        try {
            const response = await axios.post(
                `${API_ENDPOINT}/app-manager`,
                {
                    appId: APP_ID,
                    email
                },
                {
                    params: { action: 'verifyEmail' },
                    headers: { 'X-Api-Key': process.env.REACT_APP_KEY_1 }
                }
            );

            if (response.data.exists) {
                setStep('install');
            } else {
                showToast('error', 'No account found with this email. Please register first.');
            }
        } catch (error) {
            showToast('error', 'Verification failed. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };
    const handleInstall = async () => {
        if (deferredPrompt) {
            try {
                await deferredPrompt.prompt();
                const result = await deferredPrompt.userChoice;
                if (result.outcome === 'accepted') {
                    showToast('success', 'App installed successfully!');
                    onClose();
                }
            } catch (error) {
                showToast('error', 'Installation failed. Please try again.');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                        {step === 'verify' ? 'Verify Your Account' : 'Install App'}
                    </h3>
                    <button onClick={onClose}>
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {step === 'verify' ? (
                    <>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your registered email"
                            className="w-full p-2 border rounded mb-4"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleVerify}
                                disabled={isVerifying}
                                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                            >
                                {isVerifying ? (
                                    <div className="flex items-center">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Verifying...
                                    </div>
                                ) : (
                                    'Continue'
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="mb-4">Your account was verified. Click below to install the app.</p>
                        <button
                            onClick={handleInstall}
                            className="w-full py-2 bg-blue-500 text-white rounded"
                        >
                            Install App
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};