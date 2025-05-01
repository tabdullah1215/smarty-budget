import React, { useState } from 'react';
import { useTransition, animated, useSpring, config } from '@react-spring/web';
import { X, Loader2 } from 'lucide-react';
import { modalTransitions, backdropTransitions } from '../utils/transitions';
import { withMinimumDelay } from '../utils/withDelay';
import { indexdbService } from '../services/IndexDBService';
import { useToast } from '../contexts/ToastContext';

const AddCategoryModal = ({
                              onClose,
                              onCategoryAdded,
                              budgetType = 'paycheck',
                              budgetCategory = null
                          }) => {
    const [categoryName, setCategoryName] = useState('');
    const [show, setShow] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const { showToast } = useToast();

    // Set accent color based on budget type
    const accentColor = budgetType === 'business'
        ? 'emerald'
        : budgetType === 'custom'
            ? 'purple'
            : 'blue';

    const baseColor = budgetType === 'business'
        ? '800'
        : budgetType === 'custom'
            ? '600'
            : '600';

    const hoverColor = budgetType === 'business'
        ? '900'
        : budgetType === 'custom'
            ? '700'
            : '700';

    const enhancedModalTransitions = {
        ...modalTransitions,
        from: {
            ...modalTransitions.from,
            scale: 0.9,
            opacity: 0
        },
        enter: {
            ...modalTransitions.enter,
            scale: 1,
            opacity: 1,
            config: {
                mass: 1,
                tension: 200,
                friction: 20
            }
        },
        leave: {
            ...modalTransitions.leave,
            scale: 0.9,
            opacity: 0,
            config: {
                duration: 200
            }
        }
    };

    const transitions = useTransition(show, enhancedModalTransitions);
    const backdropTransition = useTransition(show, {
        ...backdropTransitions,
        config: { duration: 300 }
    });

    // Input focus animation
    const inputStyles = useSpring({
        to: {
            scale: isInputFocused ? 1.02 : 1,
            borderColor: isInputFocused ? 'rgb(59, 130, 246)' : 'rgb(209, 213, 219)'
        },
        config: {
            tension: 300,
            friction: 10
        }
    });

    // Button hover animations
    const [isAddHovered, setIsAddHovered] = useState(false);
    const [isCancelHovered, setIsCancelHovered] = useState(false);

    const addButtonSpring = useSpring({
        scale: isAddHovered ? 1.05 : 1,
        shadow: isAddHovered ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
        config: config.wobbly
    });

    const cancelButtonSpring = useSpring({
        scale: isCancelHovered ? 1.05 : 1,
        shadow: isCancelHovered ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
        config: config.wobbly
    });

    const handleCancel = async () => {
        setIsCancelling(true);
        try {
            await withMinimumDelay(async () => {}, 800);
            setShow(false);
            await withMinimumDelay(async () => {}, 300);
            onClose();
        } finally {
            setIsCancelling(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryName.trim()) return;

        setIsAdding(true);
        try {
            await withMinimumDelay(async () => {
                const newCategory = {
                    id: Date.now(),
                    name: categoryName.trim(),
                    budgetCategory: budgetCategory
                };

                // Use dynamic method for fetching categories with budgetType parameter
                const categories = await indexdbService.getCategories(budgetType);
                if (categories.some(cat => cat.name.toLowerCase() === categoryName.trim().toLowerCase())) {
                    throw new Error('Category already exists');
                }

                // Use dynamic method for adding categories with budgetType parameter
                await indexdbService.addCategory(newCategory, budgetType);
                showToast('success', 'Category added successfully');
                onCategoryAdded(newCategory);
                setShow(false);
                await withMinimumDelay(async () => {}, 300);
                onClose();
            }, 1000);
        } catch (error) {
            showToast('error', error.message || 'Failed to add category');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <>
            {backdropTransition((style, item) =>
                    item && (
                        <animated.div
                            style={style}
                            className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 backdrop-blur-sm"
                            onClick={handleCancel}
                        />
                    )
            )}

            {transitions((style, item) =>
                    item && (
                        <animated.div
                            style={{
                                ...style,
                                boxShadow: style.shadow
                            }}
                            className="fixed inset-0 z-50 flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative mx-auto p-6 border w-[95%] max-w-md shadow-xl rounded-lg bg-white">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Add New {budgetType === 'business' ? 'Business ' : ''}Category
                                    </h2>
                                    <animated.button
                                        onClick={handleCancel}
                                        disabled={isCancelling || isAdding}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none
                                    transition-all duration-200 transform hover:rotate-90
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    hover:bg-gray-100 rounded-full p-1"
                                        style={{
                                            transform: style.scale.to(s => `scale(${s}) rotate(${s * 90}deg)`)
                                        }}
                                    >
                                        {isCancelling ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <X className="h-5 w-5" />
                                        )}
                                    </animated.button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category Name
                                        </label>
                                        <animated.input
                                            type="text"
                                            value={categoryName}
                                            onChange={(e) => setCategoryName(e.target.value)}
                                            onFocus={() => setIsInputFocused(true)}
                                            onBlur={() => setIsInputFocused(false)}
                                            style={inputStyles}
                                            className={`block w-full rounded-lg border-2 px-4 py-3
                                        shadow-sm focus:ring-4 focus:ring-${accentColor}-200
                                        focus:ring-opacity-50 transition-all duration-200
                                        transform`}
                                            placeholder="Enter category name"
                                            required
                                            disabled={isAdding}
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <animated.button
                                            type="button"
                                            onClick={handleCancel}
                                            disabled={isCancelling || isAdding}
                                            onMouseEnter={() => setIsCancelHovered(true)}
                                            onMouseLeave={() => setIsCancelHovered(false)}
                                            style={cancelButtonSpring}
                                            className="px-4 py-2 bg-white text-gray-700 border-2 border-gray-300
                                        rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2
                                        focus:ring-offset-2 focus:ring-gray-500 transition-colors
                                        duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                        transform"
                                        >
                                            {isCancelling ? (
                                                <span className="inline-flex items-center">
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Cancelling...
                                            </span>
                                            ) : (
                                                'Cancel'
                                            )}
                                        </animated.button>
                                        <animated.button
                                            type="submit"
                                            disabled={isAdding}
                                            onMouseEnter={() => setIsAddHovered(true)}
                                            onMouseLeave={() => setIsAddHovered(false)}
                                            style={addButtonSpring}
                                            className={`px-4 py-2 bg-${accentColor}-${baseColor} text-white rounded-lg
                                        hover:bg-${accentColor}-${hoverColor} focus:outline-none focus:ring-2
                                        focus:ring-offset-2 focus:ring-${accentColor}-500 transition-colors
                                        duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                        transform`}
                                        >
                                            {isAdding ? (
                                                <span className="inline-flex items-center">
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Adding...
                                            </span>
                                            ) : (
                                                'Add Category'
                                            )}
                                        </animated.button>
                                    </div>
                                </form>
                            </div>
                        </animated.div>
                    )
            )}
        </>
    );
};

export default AddCategoryModal;