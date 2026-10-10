import { useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';
import { addToCart, cartVar, clearCart, deleteFromCart, removeFromCart } from '../cart';

export default function useBasket() {
	const cartItems = useReactiveVar(cartVar);
	return { cartItems, onAdd: addToCart, onRemove: removeFromCart, onDelete: deleteFromCart, onDeleteAll: clearCart };
}
