import React, { useMemo } from 'react';

const BudgetTableHeader = ({
                                       items,
                                       onToggleAll,
                                   }) => {
    // Calculate master checkbox state
    const masterCheckboxState = useMemo(() => {
        if (!items?.length) return { isChecked: false, isIndeterminate: false };
        const activeItems = items.filter(item => item.isActive);

        return {
            isChecked: activeItems.length === items.length,
            isIndeterminate: activeItems.length > 0 && activeItems.length < items.length
        };
    }, [items]);

    const handleMasterCheckboxChange = () => {
        const shouldActivate = !(masterCheckboxState.isChecked || masterCheckboxState.isIndeterminate);
        onToggleAll(shouldActivate);
    };

    return (
        <thead>
        {/* Desktop Headers */}
        <tr className="bg-gray-100">
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-4 w-[140px]">
                    <input
                        type="checkbox"
                        checked={masterCheckboxState.isChecked}
                        ref={(el) => {
                            if (el) el.indeterminate = masterCheckboxState.isIndeterminate;
                        }}
                        onChange={handleMasterCheckboxChange}
                        className="h-5 w-5 text-blue-600 border-3 border-gray-300 rounded-md
                                focus:ring-2 focus:ring-blue-500 cursor-pointer
                                transition-transform duration-200 hover:scale-110 active:scale-100
                                checked:bg-blue-600 checked:border-transparent"
                    />
                    <span>Category</span>
                </div>
            </th>
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
            </th>
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
            </th>
            <th className="hidden md:table-cell px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
            </th>
            <th className="hidden md:table-cell px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider pr-8">
                Actions
            </th>
        </tr>

        {/* Mobile Headers */}
        <tr className="md:hidden bg-gray-100">
            <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <input
                            type="checkbox"
                            checked={masterCheckboxState.isChecked}
                            ref={(el) => {
                                if (el) el.indeterminate = masterCheckboxState.isIndeterminate;
                            }}
                            onChange={handleMasterCheckboxChange}
                            className="h-5 w-5 text-blue-600 border-3 border-gray-300 rounded-md
                                    focus:ring-2 focus:ring-blue-500 cursor-pointer
                                    active:scale-150
                                    checked:bg-blue-600 checked:border-transparent
                                    scale-100 transform transition-transform duration-300"
                        />
                    </div>
                    <span>Budget Item</span>
                </div>
            </th>
            <th className="px-2 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider pr-4 sm:pr-8">
                Actions
            </th>
        </tr>
        </thead>
    );
};

export default BudgetTableHeader;