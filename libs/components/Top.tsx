import React, { useCallback, useEffect, useRef } from 'react';
import { useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { REACT_APP_API_URL } from '../config';

import Basket from './basket/Basket';

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const router = useRouter();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState(router.locale ?? 'en');
	const drop = Boolean(anchorEl2);
	const [colorChange, setColorChange] = useState(false);
	const [anchorEl, setAnchorEl] = React.useState<any | HTMLElement>(null);
	let open = Boolean(anchorEl);
	const [bgColor, setBgColor] = useState<boolean>(false);
	const [logoutAnchor, setLogoutAnchor] = React.useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);

	/** LIFECYCLES **/
	useEffect(() => {
		const locale = router.locale ?? 'en';
		localStorage.setItem('locale', locale);
		setLang(locale);
	}, [router.locale]);

	useEffect(() => {
		switch (router.pathname) {
			case '/product/detail':
				setBgColor(true);
				break;
			default:
				break;
		}
	}, [router]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	/** HANDLERS **/
	const langClick = (e: any) => {
		setAnchorEl2(e.currentTarget);
	};

	const langClose = () => {
		setAnchorEl2(null);
	};

	const langChoice = useCallback(
		async (e: any) => {
			const locale = e.currentTarget.id;
			setLang(locale);
			localStorage.setItem('locale', locale);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale });
		},
		[router],
	);

	const changeNavbarColor = () => {
		if (window.scrollY >= 50) {
			setColorChange(true);
		} else {
			setColorChange(false);
		}
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleHover = (event: any) => {
		if (anchorEl !== event.currentTarget) {
			setAnchorEl(event.currentTarget);
		} else {
			setAnchorEl(null);
		}
	};

	const StyledMenu = styled((props: MenuProps) => (
		<Menu
			elevation={0}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
			{...props}
		/>
	))(({ theme }) => ({
		'& .MuiPaper-root': {
			top: '109px',
			borderRadius: 6,
			marginTop: theme.spacing(1),
			minWidth: 160,
			color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
			boxShadow:
				'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
			'& .MuiMenu-list': {
				padding: '4px 0',
			},
			'& .MuiMenuItem-root': {
				'& .MuiSvgIcon-root': {
					fontSize: 18,
					color: theme.palette.text.secondary,
					marginRight: theme.spacing(1.5),
				},
				'&:active': {
					backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
				},
			},
		},
	}));

	if (typeof window !== 'undefined') {
		window.addEventListener('scroll', changeNavbarColor);
	}

	if (device == 'mobile') {
		return (
			<Stack className={'mobile-header'}>
				<div className={'announcement-bar'}>{t('Your setup. Your community. Gamenix365.')}</div>
				<Box component={'div'} className={'mobile-brand'}>
					<Link href={'/'} className={'brand-name'}>GAMENIX<span>365</span></Link>
					<Stack className={'mobile-actions'}>
						<Link
							href={user?._id ? '/mypage' : '/account/join'}
							aria-label={user?._id ? t('My account') : t('Login/Signup')}
						>
							<AccountCircleOutlinedIcon />
						</Link>
						<Basket light />
					</Stack>
				</Box>
				<Stack className={'top'}>
					<Link href={'/'} aria-current={router.pathname === '/' ? 'page' : undefined}>
						<div>{t('Home')}</div>
					</Link>
					<Link href={'/product'} aria-current={router.pathname === '/product' ? 'page' : undefined}>
						<div>{t('Products')}</div>
					</Link>
					<Link href={'/shop'} aria-current={router.pathname === '/shop' ? 'page' : undefined}>
						<div> {t('Shops')} </div>
					</Link>
					{user?._id && (
						<Link href={'/orders'} aria-current={router.pathname === '/orders' ? 'page' : undefined}>
							<div>{t('Orders')}</div>
						</Link>
					)}
					<Link href={'/events'} aria-current={router.pathname === '/events' ? 'page' : undefined}>
						<div>{t('Events')}</div>
					</Link>
					<Link href={'/community?articleCategory=FREE'} aria-current={router.pathname === '/community' ? 'page' : undefined}>
						<div> {t('Community')} </div>
					</Link>
					<Link href={'/cs'} aria-current={router.pathname === '/cs' ? 'page' : undefined}>
						<div> {t('CS')} </div>
					</Link>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'navbar'}>
				<div className={'announcement-bar'}>{t('Your setup. Your community. Gamenix365.')}</div>
				<Stack className={`navbar-main ${colorChange ? 'transparent' : ''} ${bgColor ? 'transparent' : ''}`}>
					<Stack className={'container'}>
						<Box component={'div'} className={'logo-box'}>
							<Link href={'/'} aria-current={router.pathname === '/' ? 'page' : undefined}>
								<span className={'brand-name'}>GAMENIX<span>365</span></span>
							</Link>
						</Box>
						<Box component={'div'} className={'router-box'}>
							<Link href={'/'} aria-current={router.pathname === '/' ? 'page' : undefined}>
								<div>{t('Home')}</div>
							</Link>
							<Link href={'/product'} aria-current={router.pathname === '/product' ? 'page' : undefined}>
								<div>{t('Products')}</div>
							</Link>
							<Link href={'/shop'} aria-current={router.pathname === '/shop' ? 'page' : undefined}>
								<div> {t('Shops')} </div>
							</Link>
							{user?._id && (
								<Link href={'/orders'} aria-current={router.pathname === '/orders' ? 'page' : undefined}>
									<div>{t('Orders')}</div>
								</Link>
							)}
							<Link href={'/events'} aria-current={router.pathname === '/events' ? 'page' : undefined}>
								<div>{t('Events')}</div>
							</Link>
							<Link href={'/community?articleCategory=FREE'} aria-current={router.pathname === '/community' ? 'page' : undefined}>
								<div> {t('Community')} </div>
							</Link>
							{user?._id && (
								<Link href={'/mypage'} aria-current={router.pathname === '/mypage' ? 'page' : undefined}>
									<div> {t('My Page')} </div>
								</Link>
							)}
							<Link href={'/cs'} aria-current={router.pathname === '/cs' ? 'page' : undefined}>
								<div> {t('CS')} </div>
							</Link>
						</Box>
						<Box component={'div'} className={'user-box'}>
							<Basket light />
							{user?._id ? (
								<>
									<div className={'login-user'} onClick={(event: any) => setLogoutAnchor(event.currentTarget)}>
										<img
											src={
												user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'
											}
											alt=""
										/>
									</div>

									<Menu
										id="basic-menu"
										anchorEl={logoutAnchor}
										open={logoutOpen}
										onClose={() => {
											setLogoutAnchor(null);
										}}
										sx={{ mt: '5px' }}
									>
										<MenuItem onClick={() => logOut()}>
											<Logout fontSize="small" style={{ color: 'blue', marginRight: '10px' }} />
											{t('Logout')}
										</MenuItem>
									</Menu>
								</>
							) : (
								<Link href={'/account/join'} aria-current={router.pathname === '/account/join' ? 'page' : undefined}>
									<div className={'join-box'}>
										<AccountCircleOutlinedIcon />
										<span>
											{t('Login')} / {t('Register')}
										</span>
									</div>
								</Link>
							)}

							<div className={'lan-box'}>
								{user?._id && <NotificationsOutlinedIcon className={'notification-icon'} />}
								<Button
									disableRipple
									className="btn-lang"
									aria-label={t('Change language')}
									onClick={langClick}
									endIcon={<CaretDown size={14} color="#616161" weight="fill" />}
								>
									<Box component={'div'} className={'flag'}>
										<img
											src={`/img/flag/lang${lang}.png`}
											alt={t(lang === 'kr' ? 'Korean' : lang === 'ru' ? 'Russian' : 'English')}
										/>
									</Box>
								</Button>

								<StyledMenu anchorEl={anchorEl2} open={drop} onClose={langClose} sx={{ position: 'absolute' }}>
									<MenuItem disableRipple onClick={langChoice} id="en">
										<img
											className="img-flag"
											src={'/img/flag/langen.png'}
											alt={t('English')}
										/>
										{t('English')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="kr">
										<img
											className="img-flag"
											src={'/img/flag/langkr.png'}
											alt={t('Korean')}
										/>
										{t('Korean')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="ru">
										<img
											className="img-flag"
											src={'/img/flag/langru.png'}
											alt={t('Russian')}
										/>
										{t('Russian')}
									</MenuItem>
								</StyledMenu>
							</div>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withRouter(Top);
