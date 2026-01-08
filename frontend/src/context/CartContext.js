import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({}); // { drinkId: quantity }
  const [branchId, setBranchIdState] = useState(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedBranchId = localStorage.getItem('branchId');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedBranchId) {
      setBranchIdState(parseInt(savedBranchId));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (branchId) {
      localStorage.setItem('branchId', String(branchId));
    } else {
      localStorage.removeItem('branchId');
    }
  }, [cart, branchId]);

  const setBranch = (newBranchId) => {
    if (branchId !== newBranchId) {
      setCart({});
      setBranchIdState(newBranchId);
    }
  };

  const addToCart = (drinkId, price, itemBranchId) => {
    if (Object.keys(cart).length === 0) {
      setBranchIdState(itemBranchId);
    } 
    else if (itemBranchId !== branchId) {
      console.error("Attempted to add item from a different branch.");
      alert("You can only order from one branch at a time. Changing branches will clear your cart.");
      return;
    }
    
    setCart((prevCart) => ({
      ...prevCart,
      [drinkId]: (prevCart[drinkId] || 0) + 1,
    }));
  };

  const removeFromCart = (drinkId, removeAll = false) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (removeAll || newCart[drinkId] <= 1) {
        delete newCart[drinkId];
      } else {
        newCart[drinkId] -= 1;
      }
      
      if (Object.keys(newCart).length === 0) {
        setBranchIdState(null);
      }
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
    setBranchIdState(null);
  };
  
  const getCartTotal = (drinks) => {
    if (!drinks || drinks.length === 0) return 0;
    return Object.entries(cart).reduce((total, [drinkId, quantity]) => {
        const drink = drinks.find(d => d.id === parseInt(drinkId));
        return total + (drink ? drink.price * quantity : 0);
    }, 0);
  };

  return (
    <CartContext.Provider value={{ cart, branchId, addToCart, removeFromCart, clearCart, getCartTotal, setBranch }}>
      {children}
    </CartContext.Provider>
  );
};