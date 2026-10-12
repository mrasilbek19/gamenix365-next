import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar, useApolloClient } from '@apollo/client';
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { userVar } from '../../apollo/store';
import { GET_MY_ORDERS, GET_MEMBER } from '../../apollo/user/query';
import { CREATE_ORDER, UPDATE_ORDER } from '../../apollo/user/mutation';
import { cartVar, clearCart, clearPurchasedCart, saveCart } from '../../libs/cart';
import { OrderDeliveryType, OrderStatus } from '../../libs/enums/order.enum';
import { Order } from '../../libs/types/order/order';
import { imageUrl } from '../../libs/uploads';
import { sweetConfirmAlert } from '../../libs/sweetAlert';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Orders: NextPage = () => {
	const user = useReactiveVar(userVar);
	const cart = useReactiveVar(cartVar);
	const client = useApolloClient();
	const [delivery, setDelivery] = useState(OrderDeliveryType.DELIVERY);
	const [address, setAddress] = useState('');
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState(OrderStatus.PAUSE);
	const [message, setMessage] = useState('');
	const [success, setSuccess] = useState('');
	const tabs = [
		{ value: OrderStatus.PAUSE, label: 'Awaiting confirmation' },
		{ value: OrderStatus.PROCESS, label: 'In progress' },
		{ value: OrderStatus.FINISHED, label: 'Completed' },
	];

	/** APOLLO REQUESTS **/
	const [createOrder, { loading: creating }] = useMutation(CREATE_ORDER);
	const [updateOrder, { loading: updating }] = useMutation(UPDATE_ORDER);
	const { data, loading, error, refetch } = useQuery(GET_MY_ORDERS, {
		variables: { input: { page, limit: 10, orderStatus: status } },
		skip: !user._id,
		fetchPolicy: 'network-only',
	});
	const orders: Order[] = data?.getMyOrders ?? [];
	const subtotal = cart.reduce((total, item) => total + item.product.productPrice * item.itemQuantity, 0);
	const fee = delivery === 'PICKUP' ? 0 : cart.some(item => ['CHAIR', 'DESK'].includes(item.product.productType)) ? 15 : subtotal < 100 ? 5 : 0;

	/** HANDLERS **/
	const changeStatusHandler = (value: OrderStatus) => {
		setStatus(value);
		setPage(1);
		setMessage('');
	};

	const updateOrderHandler = async (order: Order) => {
		try {
			const nextStatus = order.orderStatus === OrderStatus.PAUSE ? OrderStatus.PROCESS : OrderStatus.FINISHED;
			if (!(await sweetConfirmAlert(nextStatus === OrderStatus.PROCESS ? 'Confirm this order?' : 'Mark this order as received?'))) return;
			setMessage('');
			await updateOrder({ variables: { input: { _id: order._id, orderStatus: nextStatus } } });
			await refetch({ input: { page: 1, limit: 10, orderStatus: nextStatus } });
			setStatus(nextStatus);
			setPage(1);
			const profile = await client.query({ query: GET_MEMBER, variables: { input: user._id }, fetchPolicy: 'network-only' });
			userVar({ ...userVar(), ...profile.data.getMember });
		} catch (err: any) {
			setMessage(err.message);
		}
	};

	if (!user._id) return (
		<div id="orders-page"><Alert severity="info"><Link href="/account/join?referrer=/orders">Log in to view your orders.</Link></Alert></div>
	);

	return (
		<div id="orders-page">
			<Stack className={'orders-heading'}>
				<Typography className={'eyebrow'}>YOUR GAMENIX ACCOUNT</Typography>
				<Typography variant="h4">My Orders</Typography>
				<Typography>Review and manage your gaming equipment orders.</Typography>
			</Stack>
			<div className={'orders-layout'}>
				<Stack className={'order-left'} spacing={3}>
					<div className={'order-tabs'} role="tablist" aria-label="Order status">
						{tabs.map(tab => (
							<button key={tab.value} role="tab" aria-selected={status === tab.value} className={status === tab.value ? 'active' : ''} onClick={() => changeStatusHandler(tab.value)}>
								{tab.label}
							</button>
						))}
					</div>
					{message && <Alert severity="error">{message}</Alert>}
					{success && <Alert severity="success">{success}</Alert>}
					{loading ? <Typography className={'order-empty'}>Loading orders...</Typography> : error ? <Alert severity="error">{error.message}</Alert> : orders.length === 0 ? (
						<div className={'order-empty'}><Typography variant="h6">No orders here yet</Typography><Typography>Your {tabs.find(tab => tab.value === status)?.label.toLowerCase()} orders will appear here.</Typography><Link href="/product">Browse products</Link></div>
					) : orders.map(order => (
						<div className={'order-card'} key={order._id}>
							<div className={'order-summary'}>
								<div><Typography className={'eyebrow'}>ORDER #{order._id.slice(-8).toUpperCase()}</Typography><Typography variant="body2">{new Date(order.createdAt).toLocaleDateString('en-US')}</Typography></div>
								<span className={`order-status ${order.orderStatus.toLowerCase()}`}>{tabs.find(tab => tab.value === order.orderStatus)?.label}</span>
							</div>
							<div className={'order-products'}>
								{order.orderItems?.map(item => {
									const product = order.productData?.find(product => product._id === item.productId);
									return (
										<div className={'order-product'} key={item._id}>
											<img src={imageUrl(product?.productImages[0])} alt={product?.productName ?? 'Product'} />
											<Link href={`/product/detail?id=${item.productId}`}>{product?.productName ?? 'Product'}</Link>
											<div className={'order-line-price'}><Typography>${item.itemPrice.toFixed(2)} × {item.itemQuantity}</Typography><strong>${(item.itemPrice * item.itemQuantity).toFixed(2)}</strong></div>
										</div>
									);
								})}
							</div>
							<Typography variant="body2" className={'order-delivery'}>{order.orderDeliveryType === 'PICKUP' ? 'Pickup at shop' : `Delivery to: ${order.orderAddress ?? ''}`}</Typography>
							<div className={'order-totals'}>
								<div><span>Product price</span><strong>${(order.orderTotal - order.orderDelivery).toFixed(2)}</strong></div>
								<div><span>Delivery</span><strong>{order.orderDelivery ? `$${order.orderDelivery.toFixed(2)}` : 'FREE'}</strong></div>
								<div className={'order-total'}><span>Total</span><strong>${order.orderTotal.toFixed(2)}</strong></div>
							</div>
							{order.orderStatus !== OrderStatus.FINISHED && (
								<div className={'order-actions'}><Button variant="contained" disabled={updating || user.memberStatus !== 'ACTIVE'} onClick={() => updateOrderHandler(order)}>{updating ? 'Updating...' : order.orderStatus === OrderStatus.PAUSE ? 'Confirm order' : 'Mark as received'}</Button></div>
							)}
						</div>
					))}
					<div className={'order-pagination'}><Button disabled={page === 1 || loading} onClick={() => setPage(page - 1)}>Previous</Button><Typography>Page {page}</Typography><Button disabled={loading || orders.length < 10} onClick={() => setPage(page + 1)}>Next</Button></div>
					{cart.length > 0 && (
						<details className={'order-checkout'}>
							<summary>Basket checkout · {cart.length} products</summary>
							<Stack component="form" spacing={2} onSubmit={async (e: React.FormEvent) => {
								e.preventDefault(); setMessage(''); setSuccess('');
								try {
									const orderedItems = [...cart];
									const memberId = user._id;
									const { data: result } = await createOrder({
										variables: {
											input: {
												orderDeliveryType: delivery,
												...(delivery === 'DELIVERY' ? { orderAddress: address.trim() } : {}),
												orderItems: orderedItems.map((item) => ({ productId: item.product._id, itemQuantity: item.itemQuantity })),
											},
										},
									});
									clearPurchasedCart(orderedItems, memberId);
									setSuccess(`Order created. Total: $${result.createOrder.orderTotal.toFixed(2)}.`);
									setPage(1);
									setStatus(OrderStatus.PAUSE);
									await refetch({ input: { page: 1, limit: 10, orderStatus: OrderStatus.PAUSE } });
								} catch (err: any) { setMessage(err.message); }
							}}>
								{cart.map(item => <Stack key={item.product._id} spacing={1}>
									<Typography>{item.product.productName} · ${item.product.productPrice.toFixed(2)}</Typography>
									<TextField required label="Quantity" type="number" inputProps={{ min: 1, max: item.product.productLeftCount, step: 1 }} value={item.itemQuantity} onChange={e => {
										const count = Number(e.target.value);
										if (Number.isInteger(count) && count >= 1 && count <= item.product.productLeftCount) {
											saveCart(cart.map((line) => line.product._id === item.product._id ? { ...line, itemQuantity: count } : line));
										}
									}} /><Button onClick={() => saveCart(cart.filter(line => line.product._id !== item.product._id))}>Remove</Button>
								</Stack>)}
								<TextField select label="Fulfillment" value={delivery} onChange={e => setDelivery(e.target.value as OrderDeliveryType)}><MenuItem value="DELIVERY">Delivery</MenuItem><MenuItem value="PICKUP">Pickup</MenuItem></TextField>
								{delivery === 'DELIVERY' && <TextField required label="Delivery address" value={address} onChange={e => setAddress(e.target.value)} />}
								<Typography>Subtotal: ${subtotal.toFixed(2)} · Delivery: ${fee.toFixed(2)} · Estimated total: ${(subtotal + fee).toFixed(2)}</Typography>
								<Button variant="contained" type="submit" disabled={creating || user.memberStatus !== 'ACTIVE' || (delivery === 'DELIVERY' && !address.trim())}>Place order</Button>
								<Button onClick={() => clearCart()} disabled={creating}>Clear cart</Button>
							</Stack>
						</details>
					)}
				</Stack>
				<aside className={'order-account'}>
					<img src={imageUrl(user.memberImage)} alt={user.memberNick} />
					<Typography variant="h6">{user.memberNick}</Typography>
					<Typography className={'member-role'}>{user.memberType}</Typography>
					<div className={'account-details'}><Typography>{user.memberAddress || 'No address added'}</Typography><Typography>My points: <strong>{user.memberPoints ?? 0}</strong></Typography></div>
					<Link href="/mypage">My profile</Link>
				</aside>
			</div>
		</div>
	);
};

export default withLayoutBasic(Orders);
