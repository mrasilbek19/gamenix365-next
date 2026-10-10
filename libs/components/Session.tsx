import { useEffect } from 'react';
import { useApolloClient, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { getJwtToken, updateUserInfo, logOut } from '../auth';
import { userVar } from '../../apollo/store';
import { GET_MEMBER } from '../../apollo/user/query';

// Hydrate the existing reactive variable, then refresh profile/approval from the API.
export default function Session() {
	const client = useApolloClient();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	useEffect(() => {
		const hydrate = () => { const token = getJwtToken(); if (token) updateUserInfo(token); };
		hydrate();
		const sync = (event: StorageEvent) => { if (event.key === 'logout') window.location.reload(); else if (event.key === 'login') { void client.clearStore(); hydrate(); } };
		window.addEventListener('storage', sync);
		return () => window.removeEventListener('storage', sync);
	}, [client]);
	useEffect(() => {
		if (!user._id) return;
		let cancelled = false;
		const refresh = async () => {
			try {
				const { data } = await client.query({ query: GET_MEMBER, variables: { input: user._id }, fetchPolicy: 'network-only' });
				if (!cancelled && data?.getMember) {
					if (['BLOCK', 'DELETE'].includes(data.getMember.memberStatus)) { logOut(); return; }
					userVar({ ...userVar(), ...data.getMember });
				}
			} catch { /* Page-level requests display connectivity errors. Keep the signed session for retry. */ }
		};
		void refresh();
		window.addEventListener('focus', refresh);
		return () => { cancelled = true; window.removeEventListener('focus', refresh); };
	}, [client, user._id, router.asPath]);
	return null;
}
