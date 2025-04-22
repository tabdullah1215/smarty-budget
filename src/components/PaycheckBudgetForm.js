// import React, { useState, useEffect } from 'react';
// import { useTransition, animated } from '@react-spring/web';
// import { X, Loader2, Calendar, DollarSign } from 'lucide-react';
// import { withMinimumDelay } from '../utils/withDelay';
// import { modalTransitions, backdropTransitions } from '../utils/transitions';
// import { disableScroll, enableScroll } from '../utils/scrollLock';
//
// export const PaycheckBudgetForm = ({
//                                        onSave,
//                                        onClose,
//                                        isSaving = false
//                                    }) => {
//     const [paycheckDate, setPaycheckDate] = useState(new Date().toISOString().split('T')[0]);
//     const [amount, setAmount] = useState('');
//     const [isCancelling, setIsCancelling] = useState(false);
//     const [error, setError] = useState('');
//     const [isAdding, setIsAdding] = useState(false);
//     const [show, setShow] = useState(true);
//
//     const transitions = useTransition(show, modalTransitions);
//     const backdropTransition = useTransition(show, backdropTransitions);
//
//     useEffect(() => {
//         disableScroll();
//         return () => {
//             enableScroll();
//         };
//     }, []);
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setIsAdding(true);
//
//         try {
//             await withMinimumDelay(async () => {
//                 const budgetName = `Budget for ${new Date(paycheckDate).toLocaleDateString()} Paycheck`;
//                 await onSave({
//                     name: budgetName,
//                     date: paycheckDate,
//                     amount: Number(amount),
//                     items: []
//                 });
//                 setShow(false); // Trigger exit animation
//                 await withMinimumDelay(async () => {}); // Wait for animation
//                 onClose(); // Close after animation completes
//             }, 2000);
//         } catch (error) {
//             console.error('Error saving:', error);
//             setError('Failed to save. Please try again.');
//             throw error;
//         } finally {
//             setIsAdding(false);
//         }
//     };
//
//     const handleCancel = async () => {
//         setIsCancelling(true);
//         await withMinimumDelay(async () => {});
//         setShow(false);
//         await withMinimumDelay(async () => {});
//         setIsCancelling(false);
//         onClose();
//     };
//
//     return (
//         <>
//             {backdropTransition((style, item) =>
//                     item && (
//                         <animated.div
//                             style={style}
//                             className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40"
//                         />
//                     )
//             )}
//
//             {transitions((style, item) =>
//                     item && (
//                         <animated.div
//                             style={style}
//                             className="fixed inset-0 z-50 flex items-center justify-center"
//                         >
//                             <div className="relative mx-auto p-8 border w-[95%] max-w-xl shadow-lg rounded-lg bg-white">
//                                 <div className="flex justify-between items-center mb-6">
//                                     <div className="flex items-center space-x-3">
//                                         <Calendar className="h-8 w-8 text-blue-600" />
//                                         <h2 className="text-2xl font-semibold text-gray-900">New Paycheck Budget</h2>
//                                     </div>
//                                     <button
//                                         onClick={handleCancel}
//                                         disabled={isCancelling || isSaving}
//                                         className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200
//                     disabled:opacity-50 disabled:cursor-not-allowed p-2 hover:bg-gray-100 rounded-full"
//                                     >
//                                         {isCancelling ? (
//                                             <Loader2 className="h-6 w-6 animate-spin" />
//                                         ) : (
//                                             <X className="h-6 w-6" />
//                                         )}
//                                     </button>
//                                 </div>
//
//                                 <form onSubmit={handleSubmit} className="space-y-6">
//                                     <div>
//                                         <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                                             <Calendar className="h-5 w-5 text-gray-400 mr-2" />
//                                             Paycheck Date
//                                         </label>
//                                         <div className="relative">
//                                             <input
//                                                 type="date"
//                                                 value={paycheckDate}
//                                                 onChange={(e) => setPaycheckDate(e.target.value)}
//                                                 className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3
//                         shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200
//                         focus:ring-opacity-50 transition-colors duration-200
//                         appearance-none bg-white"
//                                                 required
//                                                 disabled={isSaving}
//                                                 style={{
//                                                     colorScheme: 'light'
//                                                 }}
//                                             />
//                                             <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 pointer-events-none" />
//                                         </div>
//                                     </div>
//
//                                     <div>
//                                         <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
//                                             <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
//                                             Net Paycheck Amount
//                                         </label>
//                                         <div className="relative">
//                                             <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
//                                             <input
//                                                 type="number"
//                                                 value={amount}
//                                                 onChange={(e) => setAmount(e.target.value)}
//                                                 min="0"
//                                                 step="0.01"
//                                                 className="block w-full rounded-lg border-2 border-gray-300 pl-8 pr-4 py-3
//                         shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200
//                         focus:ring-opacity-50 transition-colors duration-200"
//                                                 placeholder="0.00"
//                                                 required
//                                                 disabled={isSaving}
//                                             />
//                                         </div>
//                                     </div>
//
//                                     {error && (
//                                         <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
//                                             {error}
//                                         </div>
//                                     )}
//
//                                     <div className="flex justify-end space-x-4 pt-6">
//                                         <button
//                                             type="button"
//                                             onClick={handleCancel}
//                                             disabled={isCancelling || isSaving}
//                                             className="inline-flex items-center px-4 py-2 bg-white text-gray-700
//                       border-2 border-gray-300 rounded-lg hover:bg-gray-50
//                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
//                       transition-all duration-200
//                       disabled:opacity-50 disabled:cursor-not-allowed
//                       min-w-[100px] justify-center shadow-sm"
//                                         >
//                                             {isCancelling ? (
//                                                 <>
//                                                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                                                     Cancelling...
//                                                 </>
//                                             ) : (
//                                                 'Cancel'
//                                             )}
//                                         </button>
//                                         <button
//                                             type="submit"
//                                             disabled={isSaving || isAdding}
//                                             className="inline-flex items-center px-4 py-2 border-2 border-transparent
//                       rounded-lg shadow-sm text-sm font-medium text-white
//                       bg-blue-600 hover:bg-blue-700
//                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
//                       transition-all duration-200
//                       disabled:opacity-50 disabled:cursor-not-allowed
//                       min-w-[100px] justify-center"
//                                         >
//                                             {isAdding || isSaving ? (
//                                                 <>
//                                                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                                                     Creating...
//                                                 </>
//                                             ) : (
//                                                 'Create Budget'
//                                             )}
//                                         </button>
//                                     </div>
//                                 </form>
//                             </div>
//                         </animated.div>
//                     )
//             )}
//         </>
//     );
// };
//
// export default PaycheckBudgetForm;