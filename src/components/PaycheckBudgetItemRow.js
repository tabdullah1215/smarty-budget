import React from 'react';
import { Loader2, Edit2, Trash2, Paperclip, XCircle } from 'lucide-react';

const PaycheckBudgetItemRow = ({
                                   item,
                                   onEdit,
                                   onDelete,
                                   onImageUpload,
                                   onRemoveImage,
                                   onToggleActive,
                                   onImageClick,
                                   editingItemId,
                                   deletingButtonId,
                                   uploadingImageItemId,
                                   isSaving
                               }) => {
    return (
        <React.Fragment>
            {/* Desktop Row */}
            <tr className={`hidden md:table-row ${!item.isActive ? 'bg-orange-50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                        <input
                            type="checkbox"
                            checked={item.isActive}
                            onChange={() => onToggleActive(item.id)}
                            className="h-5 w-5 text-blue-600 border-3 border-gray-300 rounded-md
                            focus:ring-2 focus:ring-blue-500 cursor-pointer
                            transition-transform duration-200 hover:scale-110 active:scale-100
                            checked:bg-blue-600 checked:border-transparent"
                        />
                        <div className="flex items-center space-x-2">
                            <span className="min-w-[70px]">{item.category}</span>
                            <span className={`text-orange-600 text-sm font-medium transition-opacity duration-200 ${
                                item.isActive ? 'opacity-0' : 'opacity-100'
                            }`}>
                                (Pending)
                            </span>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{item.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                    ${item.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col items-center space-y-2">
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => onEdit(item)}
                                disabled={editingItemId === item.id || isSaving}
                                className="text-blue-600 hover:text-blue-800 transition-colors duration-200
                                disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Edit item"
                            >
                                {editingItemId === item.id ? (
                                    <Loader2 className="h-6 w-6 stroke-[1.5] animate-spin"/>
                                ) : (
                                    <Edit2 className="h-6 w-6 stroke-[1.5]"/>
                                )}
                            </button>
                            <button
                                onClick={() => onDelete(item.id)}
                                disabled={deletingButtonId === item.id}
                                className="text-red-600 hover:text-red-800 transition-colors duration-200"
                                title="Delete item"
                            >
                                {deletingButtonId === item.id ? (
                                    <Loader2 className="h-6 w-6 animate-spin"/>
                                ) : (
                                    <Trash2 className="h-6 w-6 stroke-[1.5]"/>
                                )}
                            </button>
                            <button
                                onClick={() => onImageUpload(item.id)}
                                disabled={uploadingImageItemId === item.id || isSaving}
                                className="text-gray-600 hover:text-gray-800 transition-colors duration-200
                                disabled:opacity-50 disabled:cursor-not-allowed"
                                title={item.image ? "Update image" : "Add image"}
                            >
                                {uploadingImageItemId === item.id ? (
                                    <Loader2 className="h-6 w-6 stroke-[1.5] animate-spin"/>
                                ) : (
                                    <Paperclip className="h-6 w-6 stroke-[1.5]"/>
                                )}
                            </button>
                        </div>
                        {item.image && (
                            <div className="flex justify-center w-full">
                                <div className="relative">
                                    <button
                                        onClick={() => onImageClick(item)}
                                        className="relative"
                                        title="Click to enlarge"
                                    >
                                        <img
                                            src={`data:${item.fileType || 'image/png'};base64,${item.image}`}
                                            alt="Budget Item"
                                            className="w-16 h-16 object-cover rounded-md border-2 border-gray-300"
                                        />
                                    </button>
                                    <button
                                        onClick={() => onRemoveImage(item.id)}
                                        className="absolute -bottom-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1.5 shadow-sm"
                                        title="Remove attachment"
                                    >
                                        <XCircle className="h-3.5 w-3.5"/>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </td>
            </tr>

            {/* Mobile Row */}
            <tr className={`md:hidden ${!item.isActive ? 'bg-orange-50' : ''}`}>
                <td className="px-2 sm:px-6 py-4">
                    <div className="flex space-x-3">
                        <div className="flex-shrink-0 pt-1">
                            <input
                                type="checkbox"
                                checked={item.isActive}
                                onChange={() => onToggleActive(item.id)}
                                className="h-5 w-5 text-blue-600 border-3 border-gray-300 rounded-md
                                focus:ring-2 focus:ring-blue-500 cursor-pointer
                                active:scale-150
                                checked:bg-blue-600 checked:border-transparent
                                scale-100 transform transition-transform duration-300"
                            />
                        </div>
                        <div className="flex-1 flex flex-col space-y-1">
                            <div className="flex items-center">
                                <span className="font-medium text-gray-900">{item.category}</span>
                                <span className={`ml-2 text-orange-600 text-sm font-medium transition-opacity duration-200 
                                    ${item.isActive ? 'opacity-0' : 'opacity-100'}`}>
                                    (Pending)
                                </span>
                            </div>
                            <span className="text-gray-600">{item.description}</span>
                            <span className="text-gray-500 text-sm">{item.date}</span>
                            <span className="font-medium text-gray-900">${item.amount.toLocaleString()}</span>
                        </div>
                    </div>
                </td>
                <td className="px-2 sm:px-6 py-4 pr-4 sm:pr-8">
                    <div className="flex flex-col items-center space-y-2 pr-2 sm:pr-4">
                        <div className="flex justify-center space-x-2">
                            <button
                                onClick={() => onEdit(item)}
                                disabled={editingItemId === item.id || isSaving}
                                className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                title="Edit item"
                            >
                                {editingItemId === item.id ? (
                                    <Loader2 className="h-6 w-6 stroke-[1.5] animate-spin"/>
                                ) : (
                                    <Edit2 className="h-6 w-6 stroke-[1.5]"/>
                                )}
                            </button>
                            <button
                                onClick={() => onDelete(item.id)}
                                disabled={deletingButtonId === item.id}
                                className="text-red-600 hover:text-red-800 transition-colors duration-200"
                                title="Delete item"
                            >
                                {deletingButtonId === item.id ? (
                                    <Loader2 className="h-5 w-5 animate-spin"/>
                                ) : (
                                    <Trash2 className="h-5 w-5"/>
                                )}
                            </button>
                            <button
                                onClick={() => onImageUpload(item.id)}
                                disabled={uploadingImageItemId === item.id || isSaving}
                                className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                                title={item.image ? "Update image" : "Add image"}
                            >
                                {uploadingImageItemId === item.id ? (
                                    <Loader2 className="h-6 w-6 stroke-[1.5] animate-spin"/>
                                ) : (
                                    <Paperclip className="h-6 w-6 stroke-[1.5]"/>
                                )}
                            </button>
                        </div>
                        {item.image && (
                            <div className="flex justify-center w-full">
                                <div className="relative">
                                    <button
                                        onClick={() => onImageClick(item)}
                                        className="relative"
                                        title="Click to enlarge"
                                    >
                                        <img
                                            src={`data:${item.fileType || 'image/png'};base64,${item.image}`}
                                            alt="Budget Item"
                                            className="w-16 h-16 object-cover rounded-md border-2 border-gray-300"
                                        />
                                    </button>
                                    <button
                                        onClick={() => onRemoveImage(item.id)}
                                        className="absolute -bottom-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1.5 shadow-sm"
                                        title="Remove attachment"
                                    >
                                        <XCircle className="h-3.5 w-3.5"/>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </td>
            </tr>
        </React.Fragment>
    );
};

export default PaycheckBudgetItemRow