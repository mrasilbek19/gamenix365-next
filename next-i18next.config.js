module.exports = {
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'kr', 'ru'],
		localeDetection: false,
	},
	reloadOnPrerender: process.env.NODE_ENV === 'development',
	trailingSlash: true,
};
