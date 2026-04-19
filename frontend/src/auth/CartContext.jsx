import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const i = prev.findIndex((c) => c.equipmentId === item.id)
      if (i >= 0) {
        const next = [...prev]
        const q = Math.min(next[i].quantity + 1, item.quantityAvailable)
        next[i] = { ...next[i], quantity: q }
        return next
      }
      return [
        ...prev,
        {
          equipmentId: item.id,
          name: item.name,
          dailyRate: item.dailyRate,
          quantityAvailable: item.quantityAvailable,
          quantity: 1,
        },
      ]
    })
  }, [])

  const updateQty = useCallback((equipmentId, quantity) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.equipmentId === equipmentId
            ? {
                ...c,
                quantity: Math.max(
                  1,
                  Math.min(quantity, c.quantityAvailable)
                ),
              }
            : c
        )
        .filter((c) => c.quantity > 0)
    )
  }, [])

  const removeLine = useCallback((equipmentId) => {
    setCart((prev) => prev.filter((c) => c.equipmentId !== equipmentId))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = useMemo(() => cart.reduce((n, c) => n + c.quantity, 0), [cart])

  const value = useMemo(() => ({
    cart,
    addToCart,
    updateQty,
    removeLine,
    clearCart,
    cartCount
  }), [cart, addToCart, updateQty, removeLine, clearCart, cartCount])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
