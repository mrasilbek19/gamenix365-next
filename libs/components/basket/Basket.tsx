import React, { useEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Divider, IconButton, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useMutation, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { userVar } from '../../../apollo/store';
import { CREATE_ORDER } from '../../../apollo/user/mutation';
import useBasket from '../../hooks/useBasket';
import { imageUrl } from '../../uploads';
import { OrderDeliveryType } from '../../enums/order.enum';

export default function Basket({ light = false }: { light?: boolean }) {
	const { cartItems, onAdd, onRemove, onDelete, onDeleteAll } = useBasket();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const [message, setMessage] = useState('');
	const [delivery, setDelivery] = useState(OrderDeliveryType.DELIVERY);
	const [address, setAddress] = useState(user.memberAddress ?? '');
	const [createOrder, { loading }] = useMutation(CREATE_ORDER);
	const ordering = useRef(false);
	useEffect(() => {
		setAddress(user.memberAddress ?? '');
	}, [user._id, user.memberAddress]);
	const subtotal = cartItems.reduce((total, item) => total + item.product.productPrice * item.itemQuantity, 0);
	const deliveryPrice =
		delivery === OrderDeliveryType.PICKUP
			? 0
			: cartItems.some((item) => ['CHAIR', 'DESK'].includes(item.product.productType))
			? 15
			: subtotal < 100
			? 5
			: 0;
	const handleOrder = async () => {
		if (ordering.current || !cartItems.length) return;
		if (!user._id) {
			setAnchor(null);
			await router.push({ pathname: '/account/join', query: { referrer: router.asPath } });
			return;
		}
		if (user.memberStatus !== 'ACTIVE') {
			setMessage('An active account is required to place an order.');
			return;
		}
		if (delivery === OrderDeliveryType.DELIVERY && !address.trim()) {
			setMessage('Enter your delivery address.');
			return;
		}
		ordering.current = true;
		setMessage('');
		try {
			await createOrder({
				variables: {
					input: {
						orderDeliveryType: delivery,
						...(delivery === OrderDeliveryType.DELIVERY ? { orderAddress: address.trim() } : {}),
						orderItems: cartItems.map((item) => ({ productId: item.product._id, itemQuantity: item.itemQuantity })),
					},
				},
				update(cache) {
					cache.evict({ id: 'ROOT_QUERY', fieldName: 'getMyOrders' });
					cache.gc();
				},
			});
			onDeleteAll();
			setAnchor(null);
			await router.push('/orders');
		} catch (err: any) {
			setMessage(err.message);
		} finally {
			ordering.current = false;
		}
	};
	return (
		<div className="basket-menu" style={{ display: 'flex', alignItems: 'center', color: light ? '#fff' : undefined }}>
			<IconButton
				aria-label="Open shopping basket"
				aria-haspopup="dialog"
				aria-expanded={Boolean(anchor)}
				onClick={(event: any) => {
					setMessage('');
					setAnchor(event.currentTarget);
				}}
				sx={{ color: 'inherit' }}
			>
				<Badge badgeContent={cartItems.length} color="secondary">
					<ShoppingCartOutlinedIcon />
				</Badge>
			</IconButton>
			<Menu
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={() => {
					if (!ordering.current) setAnchor(null);
				}}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				PaperProps={{ sx: { width: 400, maxWidth: 'calc(100vw - 24px)', mt: 1 } }}
				MenuListProps={{ role: 'presentation', className: 'basket-content' }}
			>
				<Stack role="dialog" aria-label="Shopping basket" spacing={2} sx={{ p: 2 }}>
					<Stack direction="row" alignItems="center" justifyContent="space-between">
						<Typography variant="h6">Your basket</Typography>
						{!!cartItems.length && (
							<IconButton aria-label="Clear basket" disabled={loading} onClick={onDeleteAll}>
								<DeleteOutlineIcon />
							</IconButton>
						)}
					</Stack>
					{message && <Alert severity="error">{message}</Alert>}
					{!cartItems.length ? (
						<>
							<Typography>Your basket is empty.</Typography>
							<Link href="/product" onClick={() => setAnchor(null)}>
								Browse products
							</Link>
						</>
					) : (
						<>
							<Stack spacing={2} sx={{ maxHeight: 300, overflowY: 'auto' }}>
								{cartItems.map(({ product, itemQuantity }) => (
									<Stack key={product._id} direction="row" spacing={1} alignItems="center">
										<img
											src={imageUrl(product.productImages[0])}
											alt={product.productName}
											style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 4 }}
										/>
										<Stack sx={{ flex: 1, minWidth: 0 }}>
											<Link
												href={{ pathname: '/product/detail', query: { id: product._id } }}
												onClick={() => setAnchor(null)}
											>
												{product.productName}
											</Link>
											<Typography variant="body2">
												${product.productPrice.toFixed(2)} × {itemQuantity}
											</Typography>
											<Stack direction="row" alignItems="center">
												<IconButton
													size="small"
													aria-label={`Decrease ${product.productName} quantity`}
													disabled={loading}
													onClick={() => onRemove(product._id)}
												>
													<RemoveIcon />
												</IconButton>
												<Typography>{itemQuantity}</Typography>
												<IconButton
													size="small"
													aria-label={`Increase ${product.productName} quantity`}
													disabled={loading}
													onClick={() => {
														try {
															onAdd(product);
															setMessage('');
														} catch (err: any) {
															setMessage(err.message);
														}
													}}
												>
													<AddIcon />
												</IconButton>
											</Stack>
										</Stack>
										<IconButton
											aria-label={`Remove ${product.productName}`}
											disabled={loading}
											onClick={() => onDelete(product._id)}
										>
											<DeleteOutlineIcon />
										</IconButton>
									</Stack>
								))}
							</Stack>
							<Divider />
							<TextField
								select
								label="Fulfillment"
								value={delivery}
								disabled={loading}
								onChange={(event) => setDelivery(event.target.value as OrderDeliveryType)}
							>
								<MenuItem value="DELIVERY">Delivery</MenuItem>
								<MenuItem value="PICKUP">Pickup</MenuItem>
							</TextField>
							{delivery === OrderDeliveryType.DELIVERY && (
								<TextField
									label="Delivery address"
									required
									value={address}
									disabled={loading}
									onChange={(event) => setAddress(event.target.value)}
								/>
							)}
							<Stack direction="row" justifyContent="space-between">
								<Typography>Subtotal</Typography>
								<Typography>${subtotal.toFixed(2)}</Typography>
							</Stack>
							<Stack direction="row" justifyContent="space-between">
								<Typography>Delivery</Typography>
								<Typography>{deliveryPrice ? `$${deliveryPrice.toFixed(2)}` : 'FREE'}</Typography>
							</Stack>
							<Stack direction="row" justifyContent="space-between">
								<Typography fontWeight={700}>Estimated total</Typography>
								<Typography fontWeight={700}>${(subtotal + deliveryPrice).toFixed(2)}</Typography>
							</Stack>
							<Typography variant="caption">
								One shop per order. Final prices are confirmed when your order is created.
							</Typography>
							<Button variant="contained" disabled={loading} onClick={handleOrder}>
								{loading ? 'Ordering...' : user._id ? 'Place order' : 'Log in to order'}
							</Button>
						</>
					)}
				</Stack>
			</Menu>
		</div>
	);
}
