import React, {useEffect, useState} from 'react';
import {useParams, Navigate} from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINT } from '../config';
import DashboardHeader from './DashboardHeader';
import {CheckIcon, Loader2} from 'lucide-react';
import {isMobileDevice, shouldBypassMobileCheck} from "../utils/helpers";  // Add at the top
import { InstallPrompt } from './InstallPrompt';
import { IOSInstallInstructions } from './IOSInstallInstructions';
import {withMinimumDelay} from "../utils/withDelay";
import { useTransition, animated } from '@react-spring/web';
import { modalTransitions, backdropTransitions } from '../utils/transitions';

export function AppRegistration() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const { appId, linkType, token } = useParams();
    const [permanentMessage, setPermanentMessage] = useState({ type: '', content: '' });
    const [registrationComplete, setRegistrationComplete] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const [isLoading, setIsLoading] = useState(false);
    const [showCompleteUI, setShowCompleteUI] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);


    const transitions = useTransition(showCompleteUI, modalTransitions);
    const backdropTransition = useTransition(showCompleteUI, backdropTransitions);

    const API_KEY = process.env.REACT_APP_KEY_1;

    useEffect(() => {
        if (registrationComplete) {
            const animateIn = async () => {
                await withMinimumDelay(async () => {
                    setShowCompleteUI(true);
                }, 500);
            };
            animateIn();
        }
    }, [registrationComplete]);

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

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        setIsInstalling(true);
        try {
            await withMinimumDelay(async () => {
                await deferredPrompt.prompt();
                await deferredPrompt.userChoice;
                setDeferredPrompt(null);
            }, 800);
        } catch (error) {
            console.error('Installation failed:', error);
        } finally {
            setIsInstalling(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setPermanentMessage({ type: '', content: '' });
        setIsLoading(true);

        // Client-side validations
        if (password !== confirmPassword) {
            setPermanentMessage({
                type: 'error',
                content: 'Passwords do not match'
            });
            setIsLoading(false);
            return;
        }

        // Generic registration validation
        if (linkType === 'generic' && !orderNumber?.trim()) {
            setPermanentMessage({
                type: 'error',
                content: 'Order number is required for generic registration'
            });
            setIsLoading(false);
            return;
        }

        try {
            await withMinimumDelay(async () => {
                const payload = {
                    email,
                    password,
                    token,
                    appId,
                    linkType,
                    ...(linkType === 'generic' && { orderNumber: orderNumber.trim() })
                };

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

                    setRegistrationComplete(true);
                    sessionStorage.setItem('pendingLogin', JSON.stringify({
                        registration: 'success',
                        email: email,
                        message: 'Registration successful! Please log in with your credentials.'
                    }));
                } else {
                    console.log("Unexpected response:", response.data);
                    throw new Error('Registration failed. Please try again.');
                }
            }, 2000);
        } catch (error) {
            console.error('App registration failed:', error);

            // Handle specific API error responses
            if (error.response) {
                const errorCode = error.response.data?.code;
                const serverMessage = error.response.data?.message;

                switch (error.response.status) {
                    case 400:
                        if (errorCode === 'EMAIL_EXISTS') {
                            setPermanentMessage({
                                type: 'error',
                                content: 'This email is already registered. Please use another email or click "Already registered?" below.'
                            });
                        } else if (errorCode === 'INVALID_TOKEN') {
                            setPermanentMessage({
                                type: 'error',
                                content: 'Registration link is invalid or expired. Please request a new registration link.'
                            });
                        } else if (errorCode === 'ORDER_EXISTS') {
                            setPermanentMessage({
                                type: 'error',
                                content: 'This order number has already been used. Please check and try again.'
                            });
                        } else {
                            setPermanentMessage({
                                type: 'error',
                                content: serverMessage || 'Invalid registration data. Please check your information and try again.'
                            });
                        }
                        break;

                    case 401:
                        setPermanentMessage({
                            type: 'error',
                            content: 'Registration authorization failed. Please request a new registration link.'
                        });
                        break;

                    case 403:
                        setPermanentMessage({
                            type: 'error',
                            content: 'Registration is not allowed. Please contact support.'
                        });
                        break;

                    case 404:
                        setPermanentMessage({
                            type: 'error',
                            content: 'Registration service not found. Please try again later.'
                        });
                        break;

                    case 429:
                        setPermanentMessage({
                            type: 'error',
                            content: 'Too many registration attempts. Please wait a few minutes and try again.'
                        });
                        break;

                    case 500:
                    case 502:
                    case 503:
                        setPermanentMessage({
                            type: 'error',
                            content: 'Registration service is temporarily unavailable. Please try again later.'
                        });
                        break;

                    default:
                        setPermanentMessage({
                            type: 'error',
                            content: serverMessage || 'Registration failed. Please try again.'
                        });
                }
            } else if (error.request) {
                // Network error (no response received)
                setPermanentMessage({
                    type: 'error',
                    content: 'Unable to connect to registration service. Please check your internet connection and try again.'
                });
            } else {
                // Something else went wrong
                setPermanentMessage({
                    type: 'error',
                    content: error.message || 'An unexpected error occurred. Please try again.'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

// Update only the registrationComplete return section
// Update only the registrationComplete return section
    if (registrationComplete) {
        return (
            <>
                {backdropTransition((style, item) =>
                        item && (
                            <animated.div
                                style={style}
                                className="fixed inset-0 bg-gray-600 bg-opacity-50 z-30"
                            />
                        )
                )}
                <DashboardHeader
                    title="Registration Successful"
                    subtitle="One Last Step"
                />
                {transitions((style, item) =>
                        item && (
                            <animated.div
                                style={style}
                                className="relative z-40 min-h-screen bg-gray-200"
                            >
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
                                                            onClick={handleInstall}
                                                            disabled={isInstalling}
                                                            className="w-full py-3 px-4 bg-blue-500 text-white rounded-md
                                                    hover:bg-blue-600 transition duration-300
                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                    inline-flex items-center justify-center"
                                                        >
                                                            {isInstalling ? (
                                                                <>
                                                                    <Loader2 className="h-5 w-5 mr-2 animate-spin"/>
                                                                    Installing...
                                                                </>
                                                            ) : (
                                                                'Add to Home Screen'
                                                            )}
                                                        </button>
                                                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                            <p className="text-blue-700">
                                                                After installation, look for the app icon on your home screen
                                                                or in your app drawer to open the app.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </animated.div>
                        )
                )}
            </>
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
                            disabled={isLoading}
                            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600
        transition-all duration-200 flex items-center justify-center
        disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin"/>
                                    Registering...
                                </>
                            ) : (
                                'Register'
                            )}
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