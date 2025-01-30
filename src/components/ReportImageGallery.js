import React, { useState, useEffect } from 'react';

// Add custom print styles
const printStyles = `
    @media print {
        .page-break-before {
            page-break-before: always;
        }
        
        .image-gallery {
            break-inside: avoid;
        }
        
        .image-gallery-item {
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        .image-gallery img {
            max-height: 300px;
            width: auto;
            margin: 0 auto;
        }
    }
`;

const ReportImageGallery = ({ budgets }) => {
    const [hasImages, setHasImages] = useState(false);

    // Check if there are any images to display
    useEffect(() => {
        const imagesExist = budgets.some(budget =>
            budget.items.some(item => item.image && item.isActive)
        );
        setHasImages(imagesExist);
    }, [budgets]);

    if (!hasImages) {
        return null;
    }

    return (
        <>
            <style>{printStyles}</style>
            <div className="image-gallery mt-12 page-break-before">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Attached Documents & Receipts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {budgets.flatMap(budget =>
                        budget.items
                            .filter(item => item.image && item.isActive)
                            .map((item, index) => (
                                <div
                                    key={`${budget.id}-${index}`}
                                    className="image-gallery-item bg-white rounded-lg shadow-md p-6"
                                >
                                    <div className="flex flex-col space-y-4">
                                        <div className="aspect-w-4 aspect-h-3">
                                            <img
                                                src={`data:${item.fileType || 'image/png'};base64,${item.image}`}
                                                alt={`Receipt for ${item.description}`}
                                                className="object-contain w-full h-full rounded-lg border border-gray-200"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {item.category}
                                                </span>
                                                <span className="font-bold text-lg text-gray-900">
                                                    ${item.amount.toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-600">
                                                <p className="font-medium">{item.description}</p>
                                            </div>

                                            <div className="text-xs text-gray-500 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span>Expense Date:</span>
                                                    <span className="font-medium">{item.date}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Paycheck:</span>
                                                    <span className="font-medium">{budget.name}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Paycheck Date:</span>
                                                    <span className="font-medium">{budget.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>
        </>
    );
};

export default ReportImageGallery;