import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar, useApolloClient } from '@apollo/client';
import { Alert, Button, Card, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { userVar } from '../../apollo/store';
import { GET_MY_ORDERS, GET_MEMBER } from '../../apollo/user/query';
import { CREATE_ORDER, UPDATE_ORDER } from '../../apollo/user/mutation';
import { cartVar } from '../../libs/cart';
import { OrderDeliveryType, OrderStatus } from '../../libs/enums/order.enum';
import { Order } from '../../libs/types/order/order';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
export const getStaticProps = async ({ locale }: any) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
function Orders() {
	const user = useReactiveVar(userVar);
	const cart = useReactiveVar(cartVar);
	const client = useApolloClient();
	const [delivery, setDelivery] = useState(OrderDeliveryType.DELIVERY);
	const [address, setAddress] = useState('');
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState('');
	const [message, setMessage] = useState('');
	const [success, setSuccess] = useState('');
	const [create, { loading: creating }] = useMutation(CREATE_ORDER);
	const [update, { loading: updating }] = useMutation(UPDATE_ORDER);
	const { data, loading, error, refetch } = useQuery(GET_MY_ORDERS, { variables: { input: { page, limit: 10, ...(status ? { orderStatus: status } : {}) } }, skip: !user._id, fetchPolicy: 'network-only' });
	const subtotal = cart.reduce((total, item) => total + item.product.productPrice * item.itemQuantity, 0);
	const fee = delivery === 'PICKUP' ? 0 : cart.some(item => ['CHAIR', 'DESK'].includes(item.product.productType)) ? 15 : subtotal < 100 ? 5 : 0;
	if (!user._id) return <Alert severity="info"><Link href="/account/join?referrer=/orders">Log in to view your cart and orders.</Link></Alert>;
	return <Stack spacing={3} sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, width: '100%', mx: 'auto' }}>
		<Typography variant="h4">Cart and orders</Typography><Typography>My points: {user.memberPoints ?? 0}</Typography>
		{message && <Alert severity="error">{message}</Alert>}{success && <Alert severity="success">{success}</Alert>}
		{user.memberType === 'SHOP' && <Alert severity="info">These are your purchases. Seller order management is currently unavailable.</Alert>}
		{cart.length > 0 ? <Stack component="form" spacing={2} onSubmit={async (e: React.FormEvent) => {
			e.preventDefault(); setMessage(''); setSuccess('');
			try {
				const { data: result } = await create({ variables: { input: { orderDeliveryType: delivery, ...(delivery === 'DELIVERY' ? { orderAddress: address.trim() } : {}), orderItems: cart.map(item => ({ productId: item.product._id, itemQuantity: item.itemQuantity })) } } });
				cartVar([]); setSuccess(`Order ${result.createOrder._id} created. Total: $${result.createOrder.orderTotal.toFixed(2)} (delivery: $${result.createOrder.orderDelivery.toFixed(2)}).`); setPage(1); setStatus(''); await refetch({ input: { page: 1, limit: 10 } });
			} catch (err: any) { setMessage(err.message); }
		}}>
			<Typography variant="h5">One shop per order</Typography>
			{cart.map(item => <Card key={item.product._id} sx={{ p: 2 }}><Stack spacing={1}><Typography>{item.product.productName} · ${item.product.productPrice.toFixed(2)}</Typography>
				<TextField required label="Quantity" type="number" inputProps={{ min: 1, max: item.product.productLeftCount, step: 1 }} value={item.itemQuantity} onChange={e => {
					const count = Number(e.target.value); if (Number.isInteger(count) && count >= 1 && count <= item.product.productLeftCount) cartVar(cart.map(line => line.product._id === item.product._id ? { ...line, itemQuantity: count } : line));
				}} /><Button onClick={() => cartVar(cart.filter(line => line.product._id !== item.product._id))}>Remove</Button>
			</Stack></Card>)}
			<TextField select label="Fulfillment" value={delivery} onChange={e => setDelivery(e.target.value as OrderDeliveryType)}><MenuItem value="DELIVERY">Delivery</MenuItem><MenuItem value="PICKUP">Pickup</MenuItem></TextField>
			{delivery === 'DELIVERY' && <TextField required label="Delivery address" value={address} onChange={e => setAddress(e.target.value)} />}
			<Typography>Estimated subtotal: ${subtotal.toFixed(2)} · Delivery: ${fee.toFixed(2)} · Total: ${(subtotal + fee).toFixed(2)}. Final prices are confirmed when the order is created.</Typography>
			<Button variant="contained" type="submit" disabled={creating || user.memberStatus !== 'ACTIVE' || (delivery === 'DELIVERY' && !address.trim())}>Place order</Button>
			<Button onClick={() => cartVar([])} disabled={creating}>Clear cart</Button>
		</Stack> : <Typography>Your cart is empty. <Link href="/product">Browse products</Link></Typography>}
		<Divider /><Typography variant="h5">My order history</Typography>
		<TextField select label="Order status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><MenuItem value="">All statuses</MenuItem>{Object.values(OrderStatus).map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
		{loading && <Typography>Loading orders…</Typography>}{error && <Alert severity="error">{error.message}</Alert>}
		{data?.getMyOrders?.map((order: Order) => <Card key={order._id} sx={{ p: 2 }}><Stack spacing={1}>
			<Typography variant="h6">Order {order._id} · {order.orderStatus}</Typography><Typography>{new Date(order.createdAt).toLocaleString()} · Shop {order.shopId}</Typography>
			<Typography>Total ${order.orderTotal.toFixed(2)} · Delivery ${order.orderDelivery.toFixed(2)} · {order.orderDeliveryType}</Typography><Typography>{order.orderAddress}</Typography>
			{order.orderItems?.map(item => <Typography key={item._id}><Link href={`/product/detail?id=${item.productId}`}>{order.productData?.find(product => product._id === item.productId)?.productName ?? item.productId}</Link> · {item.itemQuantity} × ${item.itemPrice.toFixed(2)}</Typography>)}
			{order.orderStatus !== 'FINISHED' && <Button disabled={updating || user.memberStatus !== 'ACTIVE'} onClick={async () => {
				if (!window.confirm(order.orderStatus === 'PAUSE' ? 'Process this order? This deducts stock and awards points.' : 'Mark this order finished?')) return;
				try { setMessage(''); await update({ variables: { input: { _id: order._id, orderStatus: order.orderStatus === 'PAUSE' ? 'PROCESS' : 'FINISHED' } } }); await refetch(); const profile = await client.query({ query: GET_MEMBER, variables: { input: user._id }, fetchPolicy: 'network-only' }); userVar({ ...userVar(), ...profile.data.getMember }); } catch (err: any) { setMessage(err.message); await refetch(); }
			}}>{order.orderStatus === 'PAUSE' ? 'Process order' : 'Finish order'}</Button>}
		</Stack></Card>)}
		{!loading && !error && !data?.getMyOrders?.length && <Typography>No orders found.</Typography>}
		<Stack direction="row"><Button disabled={page === 1 || loading} onClick={() => setPage(page - 1)}>Previous</Button><Typography sx={{ p: 1 }}>Page {page}</Typography><Button disabled={loading || (data?.getMyOrders?.length ?? 0) < 10} onClick={() => setPage(page + 1)}>Next</Button></Stack>
	</Stack>;
}
export default withLayoutBasic(Orders);
