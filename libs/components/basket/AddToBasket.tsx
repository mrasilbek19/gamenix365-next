import React, { useState } from 'react';
import { Alert, Button, Stack } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Product } from '../../types/product/product';
import { addToCart } from '../../cart';

export default function AddToBasket({ product }: { product: Product }) {
	const [message, setMessage] = useState('');
	const [error, setError] = useState(false);
	const available = product.productStatus === 'PROCESS' && !product.deletedAt && product.productLeftCount > 0;
	return (
		<Stack spacing={1} sx={{ my: 1 }} onClick={(event: any) => event.stopPropagation()}>
			<Button
				variant="outlined"
				startIcon={<AddShoppingCartIcon />}
				disabled={!available}
				onClick={() => {
					try {
						addToCart(product);
						setError(false);
						setMessage('Added to basket');
					} catch (err: any) {
						setError(true);
						setMessage(err.message);
					}
				}}
			>
				{available ? 'Add to basket' : 'Unavailable'}
			</Button>
			{message && (
				<Alert severity={error ? 'error' : 'success'} onClose={() => setMessage('')}>
					{message}
				</Alert>
			)}
		</Stack>
	);
}
