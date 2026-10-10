// Offline basket checks. Run with: node scripts/test-basket.cjs
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');
const React = require('react');
const root = path.resolve(__dirname, '..');
for (const ext of ['.ts', '.tsx']) {
	require.extensions[ext] = (module, file) =>
		module._compile(
			ts.transpileModule(fs.readFileSync(file, 'utf8'), {
				compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
			}).outputText,
			file,
		);
}
const cart = require('../libs/cart.ts');
assert.deepStrictEqual(cart.cartVar(), []); // Import is safe without window/localStorage.
const data = new Map(),
	listeners = new Set();
let writes = 0;
global.window = {
	localStorage: {
		getItem: (key) => data.get(key) ?? null,
		setItem(key, value) {
			writes++;
			data.set(key, value);
		},
		removeItem(key) {
			writes++;
			data.delete(key);
		},
	},
	addEventListener: (_, listener) => listeners.add(listener),
	removeEventListener: (_, listener) => listeners.delete(listener),
};
const key = 'gamenix365.basket';
const product = {
	_id: '507f1f77bcf86cd799439011',
	memberId: '507f1f77bcf86cd799439012',
	productName: 'Gaming keyboard',
	productType: 'KEYBOARD',
	productStatus: 'PROCESS',
	productPrice: 25,
	productLeftCount: 8,
	productImages: ['uploads/product/keyboard.png'],
};
for (const saved of [
	'{',
	'{}',
	JSON.stringify([{ product, itemQuantity: -1 }]),
	JSON.stringify([
		{ product, itemQuantity: 1 },
		{ product, itemQuantity: 1 },
	]),
]) {
	data.set(key, saved);
	const stop = cart.syncBasketStorage();
	assert.equal(cart.cartVar().length, 0);
	stop();
}
data.set(key, JSON.stringify([{ product, itemQuantity: 2 }]));
const stop = cart.syncBasketStorage();
assert.equal(cart.cartVar()[0].itemQuantity, 2);
cart.addToCart(product);
assert.equal(JSON.parse(data.get(key))[0].itemQuantity, 3);
cart.removeFromCart(product._id);
assert.equal(cart.cartVar()[0].itemQuantity, 2);
assert.throws(() => cart.addToCart({ ...product, _id: 'other', memberId: 'another-shop' }), /one shop/);
assert.throws(() => cart.addToCart(product, 9), /unavailable/);
assert.throws(() => cart.addToCart(product, 0.5), /unavailable/);
assert.throws(() => cart.addToCart({ ...product, productStatus: 'PAUSE' }), /unavailable/);
cart.deleteFromCart(product._id);
assert(!data.has(key));
cart.addToCart(product);
cart.removeFromCart(product._id);
assert.equal(cart.cartVar().length, 0);
cart.addToCart(product);
cart.clearCart();
assert(!data.has(key));
const beforeSync = writes;
for (const listener of listeners) listener({ key, newValue: JSON.stringify([{ product, itemQuantity: 4 }]) });
assert.equal(cart.cartVar()[0].itemQuantity, 4);
assert.equal(writes, beforeSync);
for (const listener of listeners) listener({ key: null, newValue: null });
assert.equal(cart.cartVar().length, 0);
stop();
assert.equal(listeners.size, 0);
console.log(
	'PASS SSR-safe import, persistence, quantity changes, delete/clear, cross-tab sync and single-shop/availability rules',
);

let states, refs, cursor, refCursor, requests, routes, fail, resolveOrder, waitForOrder;
const hooks = {
	...React,
	useState(initial) {
		const i = cursor++;
		if (!(i in states)) states[i] = initial;
		return [
			states[i],
			(value) => {
				states[i] = typeof value === 'function' ? value(states[i]) : value;
			},
		];
	},
	useRef(initial) {
		const i = refCursor++;
		return refs[i] ?? (refs[i] = { current: initial });
	},
	useEffect() {},
};
const originalLoad = Module._load;
Module._load = function (request, parent, ...args) {
	if (parent?.filename === path.join(root, 'libs/components/basket/Basket.tsx')) {
		if (request === 'react') return hooks;
		if (request === '@mui/material')
			return Object.fromEntries(
				[
					'Alert',
					'Badge',
					'Button',
					'Divider',
					'IconButton',
					'Menu',
					'MenuItem',
					'Stack',
					'TextField',
					'Typography',
				].map((name) => [name, name]),
			);
		if (request.startsWith('@mui/icons-material/')) return { __esModule: true, default: 'Icon' };
		if (request === 'next/link') return { __esModule: true, default: 'Link' };
		if (request === 'next/router')
			return { useRouter: () => ({ asPath: '/product', push: async (target) => routes.push(target) }) };
		if (request.includes('useBasket'))
			return {
				__esModule: true,
				default: () => ({
					cartItems: cart.cartVar(),
					onAdd: cart.addToCart,
					onRemove: cart.removeFromCart,
					onDelete: cart.deleteFromCart,
					onDeleteAll: cart.clearCart,
				}),
			};
		if (request.includes('uploads')) return { imageUrl: (image) => image };
		if (request === '@apollo/client')
			return {
				useReactiveVar: (variable) => variable(),
				useMutation: () => [
					async (options) => {
						requests.push(options.variables);
						if (waitForOrder)
							await new Promise((resolve) => {
								resolveOrder = resolve;
							});
						if (fail) throw Error('Insufficient product stock');
						return { data: { createOrder: { _id: 'order' } } };
					},
					{ loading: false },
				],
			};
	}
	return originalLoad.call(this, request, parent, ...args);
};
const { userVar } = require('../apollo/store.ts');
const Basket = require('../libs/components/basket/Basket.tsx').default;
function reset(user = { _id: 'buyer', memberStatus: 'ACTIVE', memberAddress: 'Seoul' }) {
	states = [];
	refs = [];
	requests = [];
	routes = [];
	fail = false;
	waitForOrder = false;
	userVar({ ...userVar(), ...user });
	cart.cartVar([{ product, itemQuantity: 2 }]);
}
function render() {
	cursor = 0;
	refCursor = 0;
	return Basket({});
}
function nodes(node) {
	return !node || typeof node !== 'object'
		? []
		: [node, ...React.Children.toArray(node.props?.children).flatMap(nodes)];
}
function order(tree) {
	return nodes(tree).find((node) => node.type === 'Button' && node.props.variant === 'contained').props.onClick;
}
function text(node) {
	if (typeof node === 'string' || typeof node === 'number') return String(node);
	return !node || typeof node !== 'object' ? '' : React.Children.toArray(node.props?.children).map(text).join(' ');
}
(async () => {
	reset(); assert(text(render()).replace(/\s/g, '').includes('$55.00'));
	cart.cartVar([{ product: { ...product, productType: 'CHAIR' }, itemQuantity: 2 }]);
	assert(text(render()).replace(/\s/g, '').includes('$65.00'));
	cart.cartVar([{ product, itemQuantity: 4 }]); assert(text(render()).includes('FREE'));
	assert(!text(render()).includes('in stock'));
	console.log('PASS delivery estimates match backend thresholds and furniture fee without displaying inventory counts');
	reset();
	let tree = render();
	await order(tree)();
	assert.deepStrictEqual(requests[0].input, {
		orderDeliveryType: 'DELIVERY',
		orderAddress: 'Seoul',
		orderItems: [{ productId: product._id, itemQuantity: 2 }],
	});
	assert.equal(cart.cartVar().length, 0);
	assert.equal(routes[0], '/orders');
	reset();
	tree = render();
	nodes(tree)
		.find((node) => node.props?.label === 'Fulfillment')
		.props.onChange({ target: { value: 'PICKUP' } });
	await order(render())();
	assert.equal(requests[0].input.orderDeliveryType, 'PICKUP');
	assert(!('orderAddress' in requests[0].input));
	reset({ _id: '', memberAddress: '' });
	await order(render())();
	assert.equal(requests.length, 0);
	assert.equal(cart.cartVar().length, 1);
	assert.equal(routes[0].pathname, '/account/join');
	reset({ _id: 'buyer', memberStatus: 'BLOCK' });
	await order(render())();
	assert.equal(requests.length, 0);
	reset({ _id: 'buyer', memberAddress: '' });
	await order(render())();
	assert.equal(requests.length, 0);
	reset();
	fail = true;
	await order(render())();
	assert.equal(cart.cartVar().length, 1);
	assert.equal(routes.length, 0);
	reset();
	waitForOrder = true;
	tree = render();
	const pending = order(tree)();
	await order(tree)();
	assert.equal(requests.length, 1);
	resolveOrder();
	await pending;
	reset();
	cart.clearCart();
	assert(!nodes(render()).some((node) => node.type === 'Button' && node.props.variant === 'contained'));
	console.log(
		'PASS delivery/pickup checkout, login gate, active-account/address validation, failed-order retention, duplicate-order guard and empty basket',
	);
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
