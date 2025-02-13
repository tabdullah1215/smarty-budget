import React, {useEffect, useState} from 'react';
import {useParams, Navigate} from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINT } from '../config';
import DashboardHeader from './DashboardHeader';
import { CheckIcon } from 'lucide-react';
import {isMobileDevice, shouldBypassMobileCheck} from "../utils/helpers";  // Add at the top
import { InstallPrompt } from './InstallPrompt';
import { IOSInstallInstructions } from './IOSInstallInstructions';

export function AppRegistration() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const { appId, linkType, token } = useParams();
    const [permanentMessage, setPermanentMessage] = useState({ type: '', content: '' });
    const [registrationComplete, setRegistrationComplete] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    const API_KEY = process.env.REACT_APP_KEY_1;

    useEffect(() => {
        const handleInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    }, []);

    if (!isMobileDevice() && !shouldBypassMobileCheck()) {
        return <Navigate to="/" replace />;
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setPermanentMessage({ type: '', content: '' });

        if (password !== confirmPassword) {
            setPermanentMessage({
                type: 'error',
                content: 'Passwords do not match'
            });
            return;
        }

        try {
            const payload = {
                email,
                password,
                token,
                appId,
                linkType
            };

            if (linkType === 'generic') {
                if (!orderNumber) {
                    setPermanentMessage({
                        type: 'error',
                        content: 'Order number is required for generic registration'
                    });
                    return;
                }
                payload.orderNumber = orderNumber;
            }

            const response = await axios.post(
                `${API_ENDPOINT}/app-manager`,
                payload,
                {
                    params: { action: 'verifyAppPurchase' },
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Key': API_KEY
                    }
                }
            );

            if (response.data.status) {
                console.log('App registration successful:', {
                    email,
                    appId,
                    linkType,
                    orderNumber: linkType === 'generic' ? orderNumber : 'N/A'
                });

                // Set registration complete to show installation prompt
                setRegistrationComplete(true);

                // Store login info to use after installation
                sessionStorage.setItem('pendingLogin', JSON.stringify({
                    registration: 'success',
                    email: email,
                    message: 'Registration successful! Please log in with your credentials.'
                }));

                // Navigation to login will happen after user installs and reopens in PWA
            } else {
                console.log("Unexpected response:", response.data);
                setPermanentMessage({
                    type: 'error',
                    content: 'Registration failed. Please try again.'
                });
            }
        } catch (error) {
            console.log('App registration failed:', error.response?.data?.message || error.message);
            const errorMessage = error.response?.data?.message || 'An error occurred during registration. Please try again.';
            setPermanentMessage({ type: 'error', content: errorMessage });
        }
    };

    if (registrationComplete) {
        return (
            <div className="min-h-screen bg-gray-200">
                <DashboardHeader
                    title="Registration Successful"
                    subtitle="One Last Step"
                />
                <div className="p-4 sm:p-8 max-w-md mx-auto pt-32 md:pt-36">
                    <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 overflow-hidden">
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                                    <CheckIcon className="h-8 w-8 text-green-500" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Registration Complete!
                            </h2>

                            <div className="overflow-y-auto max-h-[60vh]">
                                {isIOS ? (
                                    <IOSInstallInstructions />
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-gray-600">
                                            Click below to install the app on your device:
                                        </p>
                                        <button
                                            onClick={async () => {
                                                if (deferredPrompt) {
                                                    await deferredPrompt.prompt();
                                                    await deferredPrompt.userChoice;
                                                    setDeferredPrompt(null);
                                                }
                                            }}
                                            className="w-full py-3 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                                        >
                                            Add to Home Screen
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200">
            <DashboardHeader
                title="App Registration"
                subtitle={`Registration Type: ${linkType}`}
                permanentMessage={permanentMessage}
            />
            <div className="p-8 max-w-md mx-auto pt-72 md:pt-60">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block mb-1 text-sm font-medium">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block mb-1 text-sm font-medium">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium">Confirm
                                Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        {linkType === 'generic' && (
                            <div>
                                <label htmlFor="orderNumber" className="block mb-1 text-sm font-medium">Order
                                    Number</label>
                                <input
                                    id="orderNumber"
                                    type="text"
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Register
                        </button>
                    </form>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-center text-sm text-gray-600">
                            Already registered? {' '}
                            <button
                                onClick={() => setShowInstallPrompt(true)}
                                className="text-blue-500 hover:text-blue-700 underline"
                            >
                                Click here to install app
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            <InstallPrompt
                isOpen={showInstallPrompt}
                onClose={() => setShowInstallPrompt(false)}
                deferredPrompt={deferredPrompt}
            />
        </div>
    );
}

export default AppRegistration;