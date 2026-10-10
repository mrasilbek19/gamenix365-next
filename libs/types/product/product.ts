import { ProductType, ProductStatus } from '../../enums/product.enum';
import { Member } from '../member/member';
import { Direction } from '../../enums/common.enum';
export interface Product {
	_id: string;
	productType: ProductType;
	productStatus: ProductStatus;
	productName: string;
	productPrice: number;
	productLeftCount: number;
	productImages: string[];
	productDesc?: string;
	productLikes: number;
	productViews: number;
	productComments: number;
	productRank: number;
	memberId: string;
	memberData?: Member;
	meLiked?: { myFavorite: boolean }[];
	soldAt?: string | null;
	deletedAt?: string | null;
	createdAt: string;
	updatedAt: string;
}
export interface ProductInput {
	productType: ProductType;
	productName: string;
	productPrice: number;
	productLeftCount: number;
	productImages: string[];
	productDesc?: string;
}
export interface ProductUpdate extends Partial<ProductInput> {
	_id: string;
	productStatus?: ProductStatus;
	deletedAt?: string;
}

export interface Products {
	list: Product[];
	metaCounter: { total: number }[];
}

export interface ProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: {
		memberId?: string;
		typeList?: ProductType[];
		pricesRange?: { start: number; end: number };
		periodsRange?: { start: string; end: string };
		text?: string;
	};
}

export interface ShopProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: { productStatus?: ProductStatus };
}

export interface AllProductsInquiry extends ShopProductsInquiry {}

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface TotalCounter {
	total: number;
}
