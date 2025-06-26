import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();



export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (coffee, variants = [], quantity = 1) => {
    const cartItem = {
      id: Date.now(),
      coffeeId: coffee.id,
      coffee,
      variants,
      quantity,
      subtotal: calculateItemSubtotal(coffee, variants, quantity)
    };

    setCartItems(prev => [...prev, cartItem]);
  };

  const updateCartItem = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              quantity,
              subtotal: calculateItemSubtotal(item.coffee, item.variants, quantity)
            }
          : item
      )
    );
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const calculateItemSubtotal = (coffee, variants, quantity) => {
    const basePrice = coffee.price;
    const variantPrice = variants.reduce((total, variant) => total + (variant.additional_price || 0), 0);
    return (basePrice + variantPrice) * quantity;
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.subtotal, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.length;
  };

  const isItemInCart = (coffeeId, variants = []) => {
    return cartItems.some(item => 
      item.coffeeId === coffeeId && 
      JSON.stringify(item.variants) === JSON.stringify(variants)
    );
  };

  const value = {
    cartItems,
    isLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getCartItemsCount,
    isItemInCart
  };

  return (
    <CartContext.Provider value={value}>
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