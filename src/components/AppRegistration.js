import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINT } from '../config';
import DashboardHeader from './DashboardHeader';

export function AppRegistration() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const { appId, linkType, token } = useParams();
    const navigate = useNavigate();
    const [permanentMessage, setPermanentMessage] = useState({ type: '', content: '' });

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
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.data.status) {
                console.log('App registration successful:', {
                    email,
                    appId,
                    linkType,
                    orderNumber: linkType === 'generic' ? orderNumber : 'N/A'
                });

                navigate('/login', {
                    state: {
                        registration: 'success',
                        email: email,
                        message: 'Registration successful! Please log in with your credentials.'
                    }
                });
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
                </div>
            </div>
        </div>
    );
}

export default AppRegistration;