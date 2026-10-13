// Offline basket checks. Run with: yarn node scripts/test-basket.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
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
require.extensions['.scss'] = () => {};
const cart = require('../libs/cart.ts');
const { userVar } = require('../apollo/store.ts');
assert.deepEqual(cart.cartVar(), []);
assert.doesNotThrow(() => {
	cart.saveCart([]);
	cart.restoreCart();
});
const data = new Map(),
	listeners = new Set();
let writes = 0,
	reloads = 0,
	failRead = false,
	failWrite = false;
global.window = {
	localStorage: {
		getItem(key) {
			if (failRead) throw Error('Storage unavailable');
			return data.get(key) ?? null;
		},
		setItem(key, value) {
			if (failWrite) throw Error('Storage unavailable');
			writes++;
			data.set(key, value);
		},
		removeItem(key) {
			if (failWrite) throw Error('Storage unavailable');
			writes++;
			data.delete(key);
		},
	},
	addEventListener: (_, listener) => listeners.add(listener),
	removeEventListener: (_, listener) => listeners.delete(listener),
	location: {
		reload() {
			reloads++;
		},
	},
};
global.localStorage = window.localStorage;
const key = cart.basketStorageKey;
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
const line = { product, itemQuantity: 2 };
const saved = () => JSON.parse(data.get(key) ?? 'null');
for (const value of [
	'{',
	'{}',
	'null',
	JSON.stringify([line]),
	JSON.stringify({ memberId: '', items: [null] }),
	JSON.stringify({ memberId: '', items: [{ ...line, itemQuantity: -1 }] }),
	JSON.stringify({ memberId: '', items: [{ ...line, itemQuantity: 1.5 }] }),
	JSON.stringify({ memberId: '', items: [{ ...line, itemQuantity: 9 }] }),
	JSON.stringify({ memberId: '', items: [line, line] }),
	JSON.stringify({
		memberId: '',
		items: [line, { product: { ...product, _id: 'other', memberId: 'other-shop' }, itemQuantity: 1 }],
	}),
	...[
		{ productPrice: '25' },
		{ productPrice: -1 },
		{ productPrice: null },
		{ productImages: null },
		{ productImages: [4] },
		{ productType: 'INVALID' },
		{ productStatus: 'PAUSE' },
		{ deletedAt: '2026-01-01' },
		{ productName: '' },
		{ memberId: '' },
		{ _id: '' },
		{ productLeftCount: 1.5 },
	].map((change) => JSON.stringify({ memberId: '', items: [{ ...line, product: { ...product, ...change } }] })),
]) {
	data.set(key, value);
	cart.restoreCart();
	assert.deepEqual(cart.cartVar(), []);
}
cart.saveCart([line]);
assert.deepEqual(saved(), { memberId: '', items: [line] });
cart.addToCart(product);
assert.equal(saved().items[0].itemQuantity, 3);
cart.removeFromCart(product._id);
assert.equal(saved().items[0].itemQuantity, 2);
cart.saveCart([{ product, itemQuantity: 4 }]);
cart.cartVar([]);
cart.restoreCart();
assert.equal(cart.cartVar()[0].itemQuantity, 4);
assert.throws(() => cart.addToCart({ ...product, _id: 'other', memberId: 'another-shop' }), /one shop/);
assert.throws(() => cart.addToCart(product, 9), /stock/);
assert.throws(() => cart.addToCart(product, 0.5), /stock/);
assert.throws(() => cart.addToCart({ ...product, productStatus: 'PAUSE' }), /unavailable/);
assert.equal(saved().items.length, 1);
cart.deleteFromCart(product._id);
assert.equal(saved(), null);
cart.addToCart(product);
cart.removeFromCart(product._id);
assert.equal(saved(), null);
cart.addToCart(product);
cart.clearCart();
assert.equal(saved(), null);
cart.addToCart(product);
failRead = true;
cart.restoreCart();
assert.equal(cart.cartVar().length, 1);
failRead = false;
failWrite = true;
cart.addToCart(product);
assert.equal(cart.cartVar()[0].itemQuantity, 2);
cart.clearCart();
assert.equal(cart.cartVar().length, 0);
failWrite = false;
data.clear();
console.log('PASS SSR-safe storage, restoration, add/quantity/remove/clear, malformed records and single-shop rules');

let states,
	refs,
	cursor,
	refCursor,
	effects,
	requests,
	routes,
	fail,
	resolveOrder,
	waitForOrder,
	refetches,
	failRefetch,
	failLogin = false;
const hooks = {
	...React,
	useMemo(callback) {
		return callback();
	},
	useState(initial) {
		const i = cursor++;
		if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial;
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
	useEffect(callback) {
		effects.push(callback);
	},
};
const originalLoad = Module._load;
Module._load = function (request, parent, ...args) {
	const filename = parent?.filename;
	if (filename === path.join(root, 'libs/auth/index.ts')) {
		if (request === '../../apollo/client')
			return {
				initializeApollo: () => ({
					mutate: async () => {
						if (failLogin) throw { graphQLErrors: [{ message: 'Definer: login and password do not match' }] };
						return { data: { login: { accessToken: token('buyer') } } };
					},
				}),
			};
		if (request.includes('sweetAlert')) return { sweetMixinErrorAlert: async () => {} };
	}
	if (
		['libs/components/basket/Basket.tsx', 'pages/orders/index.tsx', 'pages/_app.tsx'].some(
			(name) => filename === path.join(root, name),
		)
	) {
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
					'CssBaseline',
				].map((name) => [name, name]),
			);
		if (request === '@mui/material/styles') return { ThemeProvider: 'ThemeProvider', createTheme: (value) => value };
		if (request.includes('scss/MaterialTheme')) return { light: {} };
		if (request.startsWith('@mui/icons-material/')) return { __esModule: true, default: 'Icon' };
		if (request === 'next/link') return { __esModule: true, default: 'Link' };
		if (request === 'next/router')
			return { useRouter: () => ({ asPath: '/product', push: async (target) => routes.push(target) }) };
		if (request === 'next-i18next') return { appWithTranslation: (Component) => Component };
		if (request === 'next-i18next/serverSideTranslations') return { serverSideTranslations: async () => ({}) };
		if (request.includes('layout/LayoutBasic')) return { __esModule: true, default: (Component) => Component };
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
		if (request.includes('sweetAlert')) return { sweetConfirmAlert: async () => true };
		if (request === '../apollo/client') return { useApollo: () => ({}) };
		if (request === '@apollo/client')
			return {
				ApolloProvider: 'ApolloProvider',
				useReactiveVar: (variable) => variable(),
				useApolloClient: () => ({ query: async () => ({ data: { getMember: userVar() } }) }),
				useQuery: () => ({
					data: { getMyOrders: [] },
					loading: false,
					refetch: async () => {
						refetches++;
						if (failRefetch) throw Error('Order refresh failed');
					},
				}),
				useMutation: () => [
					async (options) => {
						requests.push(options.variables);
						if (waitForOrder)
							await new Promise((resolve) => {
								resolveOrder = resolve;
							});
						if (fail) throw Error('Insufficient product stock');
						return { data: { createOrder: { _id: 'order', orderTotal: 55 } } };
					},
					{ loading: false },
				],
			};
	}
	return originalLoad.call(this, request, parent, ...args);
};
const auth = require('../libs/auth/index.ts');
const Basket = require('../libs/components/basket/Basket.tsx').default;
const Orders = require('../pages/orders/index.tsx').default;
const App = require('../pages/_app.tsx').default;
function token(id) {
	return (
		'e30.' +
		Buffer.from(JSON.stringify({ _id: id, memberType: 'USER', memberStatus: 'ACTIVE' })).toString('base64url') +
		'.fixture'
	);
}
function reset(user = { _id: 'buyer', memberStatus: 'ACTIVE', memberAddress: 'Seoul' }) {
	states = [];
	refs = [];
	effects = [];
	requests = [];
	routes = [];
	fail = false;
	waitForOrder = false;
	refetches = 0;
	failRefetch = false;
	data.clear();
	userVar({ ...userVar(), ...user });
	cart.saveCart([{ product, itemQuantity: 2 }]);
}
function render(Component = Basket) {
	cursor = 0;
	refCursor = 0;
	effects = [];
	return Component({ Component: () => null, pageProps: {} });
}
function nodes(node) {
	return !node || typeof node !== 'object'
		? []
		: [node, ...React.Children.toArray(node.props?.children).flatMap(nodes)];
}
function text(node) {
	return typeof node === 'string' || typeof node === 'number'
		? String(node)
		: !node || typeof node !== 'object'
		? ''
		: React.Children.toArray(node.props?.children).map(text).join(' ');
}
function order(tree, Component) {
	if (Component === Basket)
		return () =>
			nodes(tree)
				.find((node) => node.type === 'Button' && node.props.variant === 'contained')
				.props.onClick();
	const address = nodes(tree).find((node) => node.props?.label === 'Delivery address');
	if (address) {
		address.props.onChange({ target: { value: 'Seoul' } });
		tree = render(Orders);
	}
	return () =>
		nodes(tree)
			.find((node) => node.props?.component === 'form')
			.props.onSubmit({ preventDefault() {} });
}
function select(tree, label, value) {
	nodes(tree)
		.find((node) => node.props?.label === label)
		.props.onChange({ target: { value } });
}
(async () => {
	reset({ _id: '', memberStatus: '', memberAddress: '' });
	auth.updateUserInfo(token('buyer'));
	assert.equal(saved().memberId, 'buyer');
	assert.equal(cart.cartVar()[0].itemQuantity, 2);
	cart.cartVar([]);
	auth.updateUserInfo(token('buyer'));
	cart.restoreCart();
	assert.equal(cart.cartVar()[0].itemQuantity, 2);
	auth.updateUserInfo(token('another-buyer'));
	assert.deepEqual(cart.cartVar(), []);
	assert.equal(saved(), null);
	cart.addToCart(product);
	const beforeLogout = reloads;
	auth.logOut();
	assert.equal(reloads, beforeLogout + 1);
	assert.equal(saved(), null);
	assert.equal(userVar()._id, '');
	auth.updateUserInfo(token('buyer'));
	assert.deepEqual(cart.cartVar(), []);
	reset({ _id: '', memberStatus: '', memberAddress: '' });
	failLogin = true;
	await auth.logIn('wrong', 'password');
	failLogin = false;
	assert.equal(saved().memberId, '');
	assert.equal(cart.cartVar().length, 1);
	console.log(
		'PASS guest login adoption, account restoration, account switching/logout isolation and failed guest login retention',
	);

	reset();
	data.set('accessToken', token('buyer'));
	cart.cartVar([]);
	render(App);
	let cleanup = effects[0]();
	assert.equal(cart.cartVar()[0].itemQuantity, 2);
	assert.equal(listeners.size, 1);
	const beforeRead = writes;
	data.set(key, JSON.stringify({ memberId: 'buyer', items: [{ product, itemQuantity: 4 }] }));
	for (const listener of listeners) listener({ key });
	assert.equal(cart.cartVar()[0].itemQuantity, 4);
	assert.equal(writes, beforeRead);
	data.set(key, JSON.stringify({ memberId: 'another-buyer', items: [line] }));
	for (const listener of listeners) listener({ key });
	assert.deepEqual(cart.cartVar(), []);
	assert.equal(writes, beforeRead);
	data.delete(key);
	for (const listener of listeners) listener({ key });
	assert.deepEqual(cart.cartVar(), []);
	cleanup();
	assert.equal(listeners.size, 0);
	for (const storageKey of ['accessToken', 'login', 'logout', null]) {
		render(App);
		cleanup = effects[0]();
		const beforeReload = reloads;
		for (const listener of [...listeners]) listener({ key: storageKey });
		assert.equal(reloads, beforeReload + 1);
		assert.equal(listeners.size, 0);
		cleanup();
	}
	console.log(
		'PASS app restoration, matching cross-tab changes without write-back, owner mismatch and authentication reload/cleanup',
	);

	for (const Component of [Basket, Orders]) {
		reset();
		let tree = render(Component);
		assert(
			text(tree)
				.replace(/\s/g, '')
				.includes(Component === Basket ? '$55.00' : 'Estimatedtotal:$55.00'),
		);
		cart.saveCart([{ product: { ...product, productType: 'CHAIR' }, itemQuantity: 2 }]);
		assert(text(render(Component)).replace(/\s/g, '').includes('$65.00'));
		cart.saveCart([{ product, itemQuantity: 4 }]);
		assert(
			text(render(Component))
				.replace(/\s/g, '')
				.includes(Component === Basket ? 'FREE' : 'Delivery:$0.00'),
		);
		reset();
		tree = render(Component);
		await order(tree, Component)();
		assert.deepEqual(requests[0].input, {
			orderDeliveryType: 'DELIVERY',
			orderAddress: 'Seoul',
			orderItems: [{ productId: product._id, itemQuantity: 2 }],
		});
		assert.deepEqual(cart.cartVar(), []);
		assert.equal(saved(), null);
		assert(Component === Basket ? routes[0] === '/orders' : refetches === 1);
		reset();
		select(render(Component), 'Fulfillment', 'PICKUP');
		await order(render(Component), Component)();
		assert.equal(requests[0].input.orderDeliveryType, 'PICKUP');
		assert(!('orderAddress' in requests[0].input));
		assert.equal(saved(), null);
		reset();
		fail = true;
		await order(render(Component), Component)();
		assert.equal(cart.cartVar()[0].itemQuantity, 2);
		assert.equal(saved().items[0].itemQuantity, 2);
		assert.equal(routes.length, 0);
		fail = false;
		await order(render(Component), Component)();
		assert.equal(saved(), null);
		reset();
		waitForOrder = true;
		tree = render(Component);
		const pending = order(tree, Component)();
		cart.addToCart(product);
		cart.addToCart({ ...product, _id: 'new-product', productName: 'New mouse', productType: 'MOUSE' });
		resolveOrder();
		await pending;
		assert.deepEqual(
			cart.cartVar().map((item) => [item.product._id, item.itemQuantity]),
			[
				[product._id, 1],
				['new-product', 1],
			],
		);
		assert.deepEqual(saved().items, cart.cartVar());
		assert.equal(requests[0].input.orderItems[0].itemQuantity, 2);
		reset();
		waitForOrder = true;
		const oldRequest = order(render(Component), Component)();
		auth.updateUserInfo(token('another-buyer'));
		cart.addToCart(product);
		resolveOrder();
		await oldRequest;
		assert.equal(saved().memberId, 'another-buyer');
		assert.equal(saved().items[0].itemQuantity, 1);
		console.log(
			'PASS',
			Component === Basket ? 'header basket' : 'Orders checkout',
			'inputs, delivery/pickup, failure/retry, successful persistence and pending-request changes/account isolation',
		);
	}
	reset();
	failRefetch = true;
	await order(render(Orders), Orders)();
	assert.equal(saved(), null);
	assert(text(render(Orders)).includes('Order refresh failed'));
	reset();
	select(render(Orders), 'Quantity', '4');
	assert.equal(saved().items[0].itemQuantity, 4);
	nodes(render(Orders))
		.find((node) => node.type === 'Button' && text(node) === 'Remove')
		.props.onClick();
	assert.equal(saved(), null);
	reset();
	nodes(render(Orders))
		.find((node) => node.type === 'Button' && text(node) === 'Clear cart')
		.props.onClick();
	assert.equal(saved(), null);
	reset({ _id: '', memberAddress: '' });
	await order(render(), Basket)();
	assert.equal(requests.length, 0);
	assert.equal(cart.cartVar().length, 1);
	assert.equal(routes[0].pathname, '/account/join');
	reset({ _id: 'buyer', memberStatus: 'BLOCK' });
	await order(render(), Basket)();
	assert.equal(requests.length, 0);
	reset({ _id: 'buyer', memberStatus: 'ACTIVE', memberAddress: '' });
	await order(render(), Basket)();
	assert.equal(requests.length, 0);
	reset();
	waitForOrder = true;
	const tree = render(),
		pending = order(tree, Basket)();
	await order(tree, Basket)();
	assert.equal(requests.length, 1);
	resolveOrder();
	await pending;
	console.log(
		'PASS Orders quantity/remove/clear, post-order refetch failure, header login/address/status gates and duplicate-order guard',
	);
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
