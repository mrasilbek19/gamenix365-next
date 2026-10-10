import axios from 'axios';
import { getJwtToken } from './auth';
import { REACT_APP_API_URL } from './config';

export function imageUrl(path?: string | null): string {
	if (!path) return '/img/profile/defaultUser.svg';
	if (path.startsWith('/') || /^https?:\/\//.test(path)) return path;
	return `${REACT_APP_API_URL}/${path}`;
}

// Existing Axios GraphQL multipart protocol; no new endpoint or upload scalar.
export async function uploadImages(files: File[], target: 'member' | 'product' | 'event' | 'article'): Promise<string[]> {
	if (!files.length || files.length > 10) throw new Error('Choose between 1 and 10 images');
	if (files.some(file => !['image/jpeg', 'image/jpg', 'image/png'].includes(file.type) || file.size > 15000000)) {
		throw new Error('Images must be JPG or PNG and no larger than 15 MB');
	}
	const form = new FormData();
	form.append('operations', JSON.stringify({ query: 'mutation ImagesUploader($files: [Upload!]!, $target: String!) { imagesUploader(files: $files, target: $target) }', variables: { files: files.map(() => null), target } }));
	form.append('map', JSON.stringify(Object.fromEntries(files.map((_, index) => [index, [`variables.files.${index}`]]))));
	files.forEach((file, index) => form.append(String(index), file));
	const { data } = await axios.post(process.env.REACT_APP_API_GRAPHQL_URL ?? `${REACT_APP_API_URL}/graphql`, form, {
		headers: { 'apollo-require-preflight': 'true', Authorization: `Bearer ${getJwtToken()}` },
	});
	if (data.errors?.length) throw new Error(data.errors.map((entry: any) => entry.message).join('; '));
	const paths = data.data?.imagesUploader;
	if (!Array.isArray(paths) || paths.length !== files.length || paths.some(path => !path)) throw new Error('Image upload failed. Please retry.');
	return paths;
}
