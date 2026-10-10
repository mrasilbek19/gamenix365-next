import { OrderDeliveryType, OrderStatus } from '../../enums/order.enum';
export interface OrderInput {
	orderDeliveryType: OrderDeliveryType;
	orderAddress?: string;
	orderItems: { productId: string; itemQuantity: number }[];
}
export interface Order {
	_id: string;
	orderTotal: number;
	orderDelivery: number;
	orderDeliveryType: OrderDeliveryType;
	orderAddress?: string;
	orderStatus: OrderStatus;
	memberId: string;
	shopId: string;
	createdAt: string;
	orderItems?: { _id: string; productId: string; itemQuantity: number; itemPrice: number }[];
	productData?: { _id: string; productName: string; productImages: string[] }[];
}
