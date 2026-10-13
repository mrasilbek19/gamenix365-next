import type { AppProps } from 'next/app';
import { ThemeProvider, ThemeOptions, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import { light, dark } from '../scss/MaterialTheme';
import { ApolloProvider, useReactiveVar } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import { themeVar, userVar } from '../apollo/store';
import { getJwtToken, updateUserInfo } from '../libs/auth';
import { basketStorageKey, restoreCart } from '../libs/cart';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';
import '../scss/theme.scss';

const App = ({ Component, pageProps }: AppProps) => {
	const mode = useReactiveVar(themeVar);
	const theme = useMemo(() => createTheme((mode === 'dark' ? dark : light) as ThemeOptions), [mode]);
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
			} else if (event.key === 'gamenix365.theme') {
				const nextMode = event.newValue === 'dark' ? 'dark' : 'light';
				themeVar(nextMode);
				document.documentElement.dataset.theme = nextMode;
			}
		};
		window.addEventListener('storage', storageHandler);
		return () => window.removeEventListener('storage', storageHandler);
	}, []);

	useEffect(() => {
		let savedMode: 'light' | 'dark' = 'light';
		try {
			if (localStorage.getItem('gamenix365.theme') === 'dark') savedMode = 'dark';
		} catch {}
		themeVar(savedMode);
		document.documentElement.dataset.theme = savedMode;
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
