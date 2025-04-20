export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(price);
}; 