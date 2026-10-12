import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { light } from '../scss/MaterialTheme';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import { userVar } from '../apollo/store';
import { getJwtToken, updateUserInfo } from '../libs/auth';
import { basketStorageKey, restoreCart } from '../libs/cart';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
	// @ts-ignore
	const [theme, setTheme] = useState(createTheme(light));
	const client = useApollo(pageProps.initialApolloState);

	/** LIFECYCLES **/
	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
		restoreCart();

		const storageHandler = (event: StorageEvent) => {
			if (event.key === null || ['accessToken', 'login', 'logout'].includes(event.key)) {
				window.removeEventListener('storage', storageHandler);
				window.location.reload();
			} else if (event.key === basketStorageKey) {
				restoreCart(userVar()._id);
			}
		};
		window.addEventListener('storage', storageHandler);
		return () => window.removeEventListener('storage', storageHandler);
	}, []);

	return (
		<ApolloProvider client={client}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Component {...pageProps} />
			</ThemeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
