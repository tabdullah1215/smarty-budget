import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Briefcase, Calculator, PiggyBank } from 'lucide-react';
import { Header } from './Header';
import { withMinimumDelay } from '../utils/withDelay';

export const Home = () => {
    const navigate = useNavigate();

    const tiles = [
        {
            id: 'custom',
            title: 'Custom Budgets',
            description: 'Create and manage custom budget plans',
            isActive: true,
            icon: <Calculator className="h-6 w-6" />,
            color: 'text-purple-600',
            borderColor: 'border-purple-600'
        },
        {
            id: 'paycheck',
            title: 'Paycheck Budgets',
            description: 'Track and manage your paycheck spending',
            isActive: true,
            icon: <Wallet className="h-6 w-6" />,
            color: 'text-blue-600',
            borderColor: 'border-blue-600'
        },
        {
            id: 'business',
            title: 'Business Trip Expenses',
            description: 'Coming soon: Track business travel expenses and receipts',
            isActive: false,
            icon: <Briefcase className="h-6 w-6" />,
            color: 'text-green-600',
            borderColor: 'border-green-600'
        },
        {
            id: 'savings',
            title: 'Savings Goals',
            description: 'Coming soon: Set and track your savings goals',
            isActive: false,
            icon: <PiggyBank className="h-6 w-6" />,
            color: 'text-orange-600',
            borderColor: 'border-orange-600'
        }
    ];

    const handleTileClick = async (tileId) => {
        const tileElement = document.getElementById(tileId);
        const iconElement = tileElement?.querySelector('.tile-icon');
        if (iconElement) {
            iconElement.classList.add('animate-spin');
            await withMinimumDelay(async () => {
                switch (tileId) {
                    case 'custom':
                        await navigate('/budgets');
                        break;
                    case 'paycheck':
                        await navigate('/paycheck-budgets');
                        break;
                    default:
                        break;
                }
            }, 1000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-200">
            <Header />
            <div className="max-w-2xl mx-auto pt-44 md:pt-32 lg:pt-28 px-4 sm:px-6 lg:px-8">
                <div className="space-y-4">
                    {tiles.map((tile) => (
                        <div
                            id={tile.id}
                            key={tile.id}
                            onClick={() => tile.isActive && handleTileClick(tile.id)}
                            className={`bg-white shadow-md rounded-lg p-6 border-2
                                ${tile.isActive ?
                                'hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer' :
                                'opacity-60 cursor-not-allowed'}
                                ${tile.borderColor}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h2 className={`text-xl font-semibold ${tile.color}`}>
                                    {tile.title}
                                </h2>
                                <div className={`${tile.color} tile-icon transition-transform duration-500`}>
                                    {tile.icon}
                                </div>
                            </div>
                            <p className="text-gray-600">{tile.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;