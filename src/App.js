import React, { useState } from 'react';
import { BudgetList } from './components/BudgetList';
import { BudgetDetails } from './components/BudgetDetails';
import { BudgetForm } from './components/BudgetForm';
import { useBudgets } from './hooks/useBudget';
import { budgetTemplates } from './data/budgetTemplates';
import { X, Plus, Loader2 } from 'lucide-react'; // Add Plus and Loader2 imports

function App() {
  const { budgets, createBudget, updateBudget, deleteBudget } = useBudgets();
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [showNewBudgetForm, setShowNewBudgetForm] = useState(false);
  const [selectedBudgetType, setSelectedBudgetType] = useState('monthly');
  const [isCreating, setIsCreating] = useState(false); // Add this state

  const handleCreateClick = async () => {
    setIsCreating(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsCreating(false);
    setShowNewBudgetForm(true);
  };

  const handleCreateBudget = async (budgetData) => {
    setIsCreating(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    createBudget(budgetData.name, budgetData.type, budgetData.totalBudget);
    setIsCreating(false);
    setShowNewBudgetForm(false);
  };

  return (
      <div className="min-h-screen bg-gray-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Smarty Budget Tracker</h1>
              <button
                  onClick={handleCreateClick}
                  disabled={isCreating}
                  className="inline-flex items-center px-4 py-2 border border-transparent
                        text-sm font-medium rounded-md shadow-sm text-white
                        bg-indigo-600 hover:bg-indigo-700
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                        transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Budget
                    </>
                )}
              </button>
            </div>
          </div>

          {/* Rest of your code remains the same */}
          {showNewBudgetForm && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-md bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Create New Budget</h2>
                    <button
                        onClick={() => setShowNewBudgetForm(false)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="mb-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Budget Type</label>
                      <select
                          value={selectedBudgetType}
                          onChange={(e) => setSelectedBudgetType(e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        {Object.keys(budgetTemplates).map(type => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                      </select>
                    </div>
                    <BudgetForm
                        onSave={handleCreateBudget}
                        onClose={() => setShowNewBudgetForm(false)}
                        budgetType={selectedBudgetType}
                        isNewBudget={true}
                    />
                  </div>
                </div>
              </div>
          )}

          {selectedBudget ? (
              <BudgetDetails
                  budget={selectedBudget}
                  onClose={() => setSelectedBudget(null)}
                  onUpdate={updateBudget}
              />
          ) : (
              <div className="bg-gray-200">
                <BudgetList
                    budgets={budgets}
                    onSelect={setSelectedBudget}
                    onDelete={deleteBudget}
                />
              </div>
          )}
        </div>
      </div>
  );
}

export default App;