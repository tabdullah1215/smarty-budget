import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTransition, animated } from '@react-spring/web';
import { modalTransitions, backdropTransitions } from '../utils/transitions';
import { withMinimumDelay } from '../utils/withDelay';

const DeleteConfirmationModal = ({
                                     isOpen,
                                     onClose,
                                     onConfirm,
                                     title = "Delete Item",
                                     message = "Are you sure you want to delete this item? This action cannot be undone."
                                 }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const transitions = useTransition(isOpen, modalTransitions);
    const backdropTransition = useTransition(isOpen, backdropTransitions);

    const handleCancel = async () => {
        setIsCancelling(true);
        try {
            await withMinimumDelay(async () => {
                onClose();
            });
        } finally {
            setIsCancelling(false);
        }
    };

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await withMinimumDelay(async () => {
                await onConfirm();
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            {backdropTransition((style, item) =>
                    item && (
                        <animated.div
                            style={style}
                            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
                        />
                    )
            )}
            {transitions((style, item) =>
                    item && (
                        <animated.div
                            style={style}
                            className="fixed inset-0 z-50 flex items-center justify-center px-4"
                        >
                            <div className="relative mx-auto p-5 border w-[90%] max-w-lg shadow-lg rounded-md bg-white">
                                <div className="mt-3 text-center">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                                    <div className="mt-2 px-7 py-3">
                                        <p className="text-sm text-gray-500">
                                            {message}
                                        </p>
                                    </div>
                                    <div className="flex justify-center space-x-4 mt-4">
                                        <button
                                            onClick={handleCancel}
                                            disabled={isCancelling || isDeleting}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md
                                                hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500
                                                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isCancelling ? (
                                                <Loader2 className="h-4 w-4 animate-spin"/>
                                            ) : (
                                                'Cancel'
                                            )}
                                        </button>
                                        <button
                                            onClick={handleConfirm}
                                            disabled={isDeleting}
                                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md
                                                hover:bg-red-700 transition-all duration-200
                                                disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                            ) : null}
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </animated.div>
                    )
            )}
        </>
    );
};

export default DeleteConfirmationModal;