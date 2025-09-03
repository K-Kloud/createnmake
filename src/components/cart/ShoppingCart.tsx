import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart as CartIcon, Plus, Minus, X, Package } from 'lucide-react';

interface CartItem {
  id: string;
  type: 'design' | 'custom_order';
  imageUrl: string;
  title: string;
  price: number;
  quantity: number;
  customizations?: {
    size?: string;
    color?: string;
    material?: string;
    notes?: string;
  };
  artisanId?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      let newItems: CartItem[];
      
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 } as CartItem];
      }
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { ...state, items: newItems, total };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { ...state, items: newItems, total };
    }
    
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { ...state, items: newItems, total };
    }
    
    case 'CLEAR_CART':
      return { ...state, items: [], total: 0 };
    
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    
    default:
      return state;
  }
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
    total: 0
  });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartButton: React.FC = () => {
  const { state, dispatch } = useCart();

  return (
    <Button
      variant="outline"
      onClick={() => dispatch({ type: 'TOGGLE_CART' })}
      className="relative gap-2"
    >
      <CartIcon className="w-4 h-4" />
      Cart
      {state.items.length > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
          {state.items.reduce((sum, item) => sum + item.quantity, 0)}
        </Badge>
      )}
    </Button>
  );
};

export const ShoppingCart: React.FC = () => {
  const { state, dispatch } = useCart();

  if (!state.isOpen) return null;

  const handleCheckout = () => {
    // TODO: Implement Stripe checkout
    console.log('Proceeding to checkout with items:', state.items);
    dispatch({ type: 'CLOSE_CART' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-md bg-background shadow-xl h-full overflow-hidden">
        <Card className="h-full flex flex-col border-0 rounded-none">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <CartIcon className="w-5 h-5" />
              Shopping Cart
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: 'CLOSE_CART' })}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-auto">
            {state.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Package className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground">
                  Browse our marketplace to find amazing fashion designs
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 border border-border rounded-lg">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 space-y-2">
                      <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-primary">
                          ${item.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => dispatch({
                              type: 'UPDATE_QUANTITY',
                              payload: { id: item.id, quantity: item.quantity - 1 }
                            })}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => dispatch({
                              type: 'UPDATE_QUANTITY',
                              payload: { id: item.id, quantity: item.quantity + 1 }
                            })}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {item.customizations && (
                        <div className="text-xs text-muted-foreground">
                          {item.customizations.size && <span>Size: {item.customizations.size}</span>}
                          {item.customizations.color && <span>, Color: {item.customizations.color}</span>}
                          {item.customizations.material && <span>, Material: {item.customizations.material}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          
          {state.items.length > 0 && (
            <div className="p-6 border-t border-border space-y-4">
              <Separator />
              <div className="flex justify-between items-center font-medium">
                <span>Total:</span>
                <span className="text-lg">${state.total.toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <Button onClick={handleCheckout} className="w-full">
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  onClick={() => dispatch({ type: 'CLEAR_CART' })}
                  className="w-full"
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};