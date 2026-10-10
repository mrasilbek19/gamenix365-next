import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Stack, Box } from '@mui/material';
import Link from 'next/link';
import moment from 'moment';

const Footer = () => {
	return (
		<Stack className={'footer-container'}>
			<Stack className={'main'}>
				<Box component={'div'} className={'footer-column'}>
					<strong>Explore the store</strong>
					<Link href={'/product'}>Gaming equipment</Link>
					<Link href={'/shop'}>Independent shops</Link>
				</Box>
				<Box component={'div'} className={'footer-column'}>
					<strong>Gaming community</strong>
					<Link href={'/community?articleCategory=FREE'}>Community boards</Link>
					<Link href={'/events'}>Tournaments & giveaways</Link>
				</Box>
				<Box component={'div'} className={'footer-column'}>
					<strong>Support</strong>
					<Link href={'/cs'}>Customer support</Link>
					<Link href={'/about'}>About Gamenix365</Link>
					<a href="tel:+821048672909">+82 10 4867 2909</a>
				</Box>
				<Box component={'div'} className={'footer-brand'}>
					<Link href={'/'} className={'brand-name'}>GAMENIX<span>365</span></Link>
					<p>Great equipment. Independent shops. One gaming community.</p>
					<p>Find your next setup and connect with people who share your passion for gaming.</p>
					<div className={'media-box'}>
						<FacebookOutlinedIcon />
						<TelegramIcon />
						<InstagramIcon />
						<TwitterIcon />
					</div>
				</Box>
			</Stack>
			<Stack className={'second'}>
				<span>© {moment().year()} Gamenix365. All rights reserved.</span>
				<span>Built for your next level.</span>
			</Stack>
		</Stack>
	);
};

export default Footer;
