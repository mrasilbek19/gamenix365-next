import { common } from '@mui/material/colors';
import shadow from './shadow';
import typography from './typography';

/**
 * LIGHT THEME (DEFAULT)
 */
export const light = {
	palette: {
		mode: 'light',
		background: {
			default: '#ffffff',
			paper: '#ffffff',
		},
		primary: {
			contrastText: '#ffffff',
			main: '#007e9e',
		},
		secondary: {
			main: '#007e9e',
		},
		text: {
			primary: '#202124',
			secondary: '#62666b',
			dark: common.black,
		},
	},
	components: {
		MuiTypography: {
			styleOverrides: {
				root: {
					letterSpacing: '0',
				},
			},
			defaultProps: {
				variantMapping: {
					h1: 'h1',
					h2: 'h2',
					h3: 'h3',
					h4: 'h4',
					h5: 'h5',
					h6: 'h6',
					subtitle1: 'p',
					subtitle2: 'p',
					subtitle3: 'p',
					body1: 'p',
					body2: 'p',
				},
			},
		},
		MuiLink: {
			styleOverrides: {
				root: {
					color: 'var(--color-text, #202124)',
					textDecoration: 'none',
				},
			},
		},
		MuiDivider: {
			styleOverrides: {
				root: {
					borderColor: 'var(--color-border, #d4d7da)',
				},
			},
		},
		MuiBox: {
			styleOverrides: {
				root: {
					padding: '0',
				},
			},
			makeStyles: {
				root: {
					padding: 0,
				},
			},
			sx: {
				'&.MuiBox-root': {
					component: 'div',
				},
			},
		},
		MuiContainer: {
			styleOverrides: {
				root: {
					maxWidth: 'inherit',
					padding: '0',
					'@media (min-width: 600px)': {
						paddingLeft: 0,
						paddingRight: 0,
					},
				},
			},
		},
		MuiCssBaseline: {
			styleOverrides: {
				html: { height: '100%' },
				body: { background: 'var(--color-paper, #ffffff)', height: '100%', minHeight: '100%' },
				p: {
					margin: '0',
				},
			},
		},
		MuiAvatar: {
			styleOverrides: {
				root: {
					marginLeft: '0',
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					color: 'var(--color-text, #202124)',
					minWidth: 'auto',
					lineHeight: '1.4',
					borderRadius: '4px',
					fontWeight: 600,
					textTransform: 'none',
					boxShadow: 'none',
					'&.MuiButton-containedPrimary, &.MuiButton-containedSecondary': {
						color: '#202124',
						backgroundColor: '#00b8ee',
						backgroundImage: 'none',
					},
					ButtonText: {
						color: 'var(--color-text, #202124)',
					},
				},
			},
		},
		MuiIconButton: {
			styleOverrides: {
				root: {},
			},
		},
		MuiListItemButton: {
			styleOverrides: {
				root: {
					padding: '0',
				},
			},
		},
		MuiList: {
			styleOverrides: {
				root: {
					padding: '0',
				},
			},
		},
		MuiListItem: {
			styleOverrides: {
				root: {
					MuiSelect: {
						backgroundColor: 'var(--color-paper, #ffffff)',
					},
					padding: '0',
				},
			},
		},
		MuiFormControl: {
			styleOverrides: {
				root: {
					width: '100%',
				},
			},
		},
		MuiFormControlLabel: {
			styleOverrides: {
				root: {
					marginRight: '0',
				},
			},
		},
		MuiSelect: {
			styleOverrides: {
				root: {},
				select: {
					textAlign: 'left',
				},
			},
		},
		MuiInputBase: {
			styleOverrides: {
				root: {
					input: {},
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					height: '48px',
					width: '100%',
					backgroundColor: 'var(--color-paper, #ffffff)',
					input: {},
				},
				notchedOutline: {
					padding: '8px',
					top: '-9px',
					border: '1px solid var(--color-border, #d4d7da)',
				},
			},
		},
		MuiFormHelperText: {
			styleOverrides: {
				root: {
					margin: '5px 0 0 2px',
					lineHeight: '1.2',
				},
			},
		},
		MuiStepper: {
			styleOverrides: {
				root: {
					alignItems: 'center',
				},
			},
		},
		MuiTabPanel: {
			styleOverrides: {
				root: {
					padding: '0',
				},
			},
		},
		MuiSvgIcon: {
			styleOverrides: {
				root: {},
			},
		},
		MuiStepIcon: {
			styleOverrides: {
				root: {
					color: 'var(--color-text, #202124)',
					borderRadius: '50%',
					border: '1px solid var(--color-border, #d4d7da)',
				},
				text: {
					fill: '#bdbdbd',
				},
			},
		},
		MuiStepConnector: {
			styleOverrides: {
				line: {
					borderColor: 'var(--color-border, #d4d7da)',
				},
			},
		},
		MuiStepLabel: {
			styleOverrides: {
				label: {
					fontSize: '14px',
				},
			},
		},
		MuiCheckbox: {
			styleOverrides: {
				root: {
					'&.Mui-checked': {
						color: 'var(--color-text, black)',
					},
				},
			},
		},
		MuiFab: {
			styleOverrides: {
				root: {
					width: '40px',
					height: '40px',
					background: 'var(--color-paper, #ffffff)',
					color: 'var(--color-text, #202124)',
				},
				hover: {
					background: 'var(--color-paper, #ffffff)',
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					MuiMenu: {
						boxShadow: 'rgb(145 158 171 / 24%) 0px 0px 2px 0px, rgb(145 158 171 / 24%) -20px 20px 40px -4px',
					},
				},
			},
		},
		MuiMenuItem: {
			styleOverrides: {
				root: {
					padding: '6px 8px',
				},
			},
		},
		MuiAlert: {
			styleOverrides: {
				root: {
					boxShadow: 'none',
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					border: '1px solid var(--color-border, #d4d7da)',
					color: 'var(--color-text, #202124)',
				},
			},
		},
	},
	shadow,
	typography,
};

export const dark = {
	...light,
	palette: {
		...light.palette,
		mode: 'dark',
		background: { default: '#101418', paper: '#1a2027' },
		primary: { main: '#00b8ee', contrastText: '#202124' },
		secondary: { main: '#00b8ee' },
		text: { primary: '#edf2f5', secondary: '#abb5bf', dark: '#edf2f5' },
	},
};
