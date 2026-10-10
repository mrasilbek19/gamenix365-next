import { makeVar } from '@apollo/client';
import { Product } from './types/product/product';
export interface CartItem { product: Product; itemQuantity: number }
export const cartVar = makeVar<CartItem[]>([]);
export function addToCart(product: Product, quantity: number) {
	const cart = cartVar();
	if (cart.length && cart[0].product.memberId !== product.memberId) throw new Error('Each order must contain products from one shop. Complete or clear your cart first.');
	const current = cart.find(item => item.product._id === product._id);
	const itemQuantity = (current?.itemQuantity ?? 0) + quantity;
	if (!Number.isInteger(quantity) || quantity < 1 || itemQuantity > product.productLeftCount) throw new Error('Choose a quantity within available stock.');
	cartVar(current ? cart.map(item => item.product._id === product._id ? { product, itemQuantity } : item) : [...cart, { product, itemQuantity }]);
}
