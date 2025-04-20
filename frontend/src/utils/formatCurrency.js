export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '₹0';
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Format the number with Indian Rupee symbol and commas
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
}; 