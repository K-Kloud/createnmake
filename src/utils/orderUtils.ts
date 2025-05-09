
export const getOrderStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
    case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/30';
    case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/30';
    default: return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
  }
};
