
import { makeVar } from '@apollo/client';
import { Product } from './types/product/product';

export interface CartItem {
	product: Product;
	itemQuantity: number;
}

export const cartVar = makeVar<CartItem[]>([]);

export const addToCart = (product: Product, quantity = 1) => {
	const cart = cartVar();

	if (product.productStatus !== 'PROCESS' || product.deletedAt) {
		throw new Error('Product is unavailable');
	}

	if (cart.length && cart[0].product.memberId !== product.memberId) {
		throw new Error('You can only order products from one shop');
	}

	const existing = cart.find((item) => item.product._id === product._id);
	const itemQuantity = (existing?.itemQuantity || 0) + quantity;

	if (
		!Number.isInteger(quantity) ||
		quantity < 1 ||
		itemQuantity > product.productLeftCount
	) {
		throw new Error('Not enough product stock');
	}

	if (existing) {
		cartVar(
			cart.map((item) =>
				item.product._id === product._id
					? { ...item, itemQuantity }
					: item,
			),
		);
	} else {
		cartVar([...cart, { product, itemQuantity: quantity }]);
	}
};

export const removeFromCart = (productId: string) => {
	const cart = cartVar();

	cartVar(
		cart
			.map((item) =>
				item.product._id === productId
					? { ...item, itemQuantity: item.itemQuantity - 1 }
					: item,
			)
			.filter((item) => item.itemQuantity > 0),
	);
};

export const deleteFromCart = (productId: string) => {
	cartVar(cartVar().filter((item) => item.product._id !== productId));
};

export const clearCart = () => {
	cartVar([]);
};
