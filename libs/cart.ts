import { makeVar } from '@apollo/client';
import { userVar } from '../apollo/store';
import { Product } from './types/product/product';
import { ProductType } from './enums/product.enum';

export interface CartItem {
	product: Product;
	itemQuantity: number;
}

export const cartVar = makeVar<CartItem[]>([]);
export const basketStorageKey = 'gamenix365.basket';

export const saveCart = (items: CartItem[], memberId = userVar()._id) => {
	cartVar(items);
	if (typeof window === 'undefined') return;

	try {
		if (items.length) window.localStorage.setItem(basketStorageKey, JSON.stringify({ memberId, items }));
		else window.localStorage.removeItem(basketStorageKey);
	} catch {
		// Keep the basket usable when browser storage is unavailable.
	}
};

export const restoreCart = (memberId = userVar()._id, keepGuest = false) => {
	if (typeof window === 'undefined') return;
	let saved: string | null;
	try {
		saved = window.localStorage.getItem(basketStorageKey);
	} catch {
		return;
	}

	try {
		const basket = JSON.parse(saved ?? 'null');
		if (
			!basket ||
			typeof basket.memberId !== 'string' ||
			!Array.isArray(basket.items) ||
			basket.items.some((item: CartItem, index: number) => {
				const product = item?.product;
				return (
					!product ||
					typeof product._id !== 'string' ||
					!product._id.trim() ||
					typeof product.memberId !== 'string' ||
					!product.memberId.trim() ||
					typeof product.productName !== 'string' ||
					!product.productName.trim() ||
					!Object.values(ProductType).includes(product.productType) ||
					product.productStatus !== 'PROCESS' ||
					!!product.deletedAt ||
					!Number.isFinite(product.productPrice) ||
					product.productPrice < 0 ||
					!Array.isArray(product.productImages) ||
					product.productImages.some((image) => typeof image !== 'string') ||
					!Number.isInteger(product.productLeftCount) ||
					!Number.isInteger(item.itemQuantity) ||
					item.itemQuantity < 1 ||
					item.itemQuantity > product.productLeftCount ||
					product.memberId !== basket.items[0]?.product?.memberId ||
					basket.items.findIndex((line: CartItem) => line?.product?._id === product._id) !== index
				);
			})
		) {
			cartVar([]);
			return;
		}

		if (basket.memberId !== memberId && !(keepGuest && basket.memberId === '')) {
			if (keepGuest) saveCart([], memberId);
			else cartVar([]);
			return;
		}

		if (keepGuest && basket.memberId === '') saveCart(basket.items, memberId);
		else cartVar(basket.items);
	} catch {
		cartVar([]);
	}
};

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

	if (!Number.isInteger(quantity) || quantity < 1 || itemQuantity > product.productLeftCount) {
		throw new Error('Not enough product stock');
	}

	if (existing) {
		saveCart(cart.map((item) => (item.product._id === product._id ? { ...item, itemQuantity } : item)));
	} else {
		saveCart([...cart, { product, itemQuantity: quantity }]);
	}
};

export const removeFromCart = (productId: string) => {
	const cart = cartVar();

	saveCart(
		cart
			.map((item) => (item.product._id === productId ? { ...item, itemQuantity: item.itemQuantity - 1 } : item))
			.filter((item) => item.itemQuantity > 0),
	);
};

export const deleteFromCart = (productId: string) => {
	saveCart(cartVar().filter((item) => item.product._id !== productId));
};

export const clearCart = () => {
	saveCart([]);
};

export const clearPurchasedCart = (items: CartItem[], memberId: string) => {
	if (userVar()._id !== memberId) return;
	saveCart(
		cartVar()
			.map((item) => ({
				...item,
				itemQuantity:
					item.itemQuantity - (items.find((line) => line.product._id === item.product._id)?.itemQuantity ?? 0),
			}))
			.filter((item) => item.itemQuantity > 0),
	);
};
