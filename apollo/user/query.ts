import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_AGENTS = gql`
	query GetAgents($input: AgentsInquiry!) {
		getAgents(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberAuthType
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberAddress
				memberDesc
				memberFollowers
				memberWarnings
				memberBlocks
				memberProducts
				memberRank
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
				accessToken
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER = gql(`
   query GetMember($input: String!) {
    getMember(memberId: $input) {
        _id
        memberType
        memberStatus
        memberAuthType
        memberPhone
        memberNick
        memberFullName
        memberImage
        memberAddress
        memberDesc
        memberProducts
        memberArticles
        memberPoints
        memberLikes
        memberViews
        memberFollowings
				memberFollowers
        memberRank
        memberWarnings
        memberBlocks
        deletedAt
        createdAt
        updatedAt
        accessToken
        meFollowed {
					followingId
					followerId
					myFollowing
				}
    }
}
`);

/**************************
 *        PRODUCT        *
 *************************/

export const GET_PRODUCT = gql`
	query GetProduct($input: String!) {
		getProduct(productId: $input) {
			_id
			productType
			productStatus
			productName
			productPrice
			productLeftCount
			productViews
			productLikes
			productComments
			productRank
			productImages
			productDesc
			memberId
			soldAt
			deletedAt
			createdAt
			updatedAt
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
			memberData {
				_id
				memberType
				memberStatus
				memberNick
				memberImage
				memberPhone
			}
		}
	}
`;

export const GET_PRODUCTS = gql`
	query GetProducts($input: ProductsInquiry!) {
		getProducts(input: $input) {
			list {
				_id
				productType
				productStatus
				productName
				productPrice
				productLeftCount
				productViews
				productLikes
				productComments
				productRank
				productImages
				productDesc
				memberId
				soldAt
				deletedAt
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData {
					_id
					memberType
					memberStatus
					memberNick
					memberImage
					memberPhone
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_SHOP_PRODUCTS = gql`
	query GetShopProducts($input: ShopProductsInquiry!) {
		getShopProducts(input: $input) {
			list {
				_id
				productType
				productStatus
				productName
				productPrice
				productLeftCount
				productViews
				productLikes
				productComments
				productRank
				productImages
				productDesc
				memberId
				soldAt
				deletedAt
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData {
					_id
					memberType
					memberStatus
					memberNick
					memberImage
					memberPhone
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_FAVORITES = gql`
	query GetFavorites($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
			list {
				_id
				productType
				productStatus
				productName
				productPrice
				productLeftCount
				productViews
				productLikes
				productComments
				productRank
				productImages
				productDesc
				memberId
				soldAt
				deletedAt
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData {
					_id
					memberType
					memberStatus
					memberNick
					memberImage
					memberPhone
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
			list {
				_id
				productType
				productStatus
				productName
				productPrice
				productLeftCount
				productViews
				productLikes
				productComments
				productRank
				productImages
				productDesc
				memberId
				soldAt
				deletedAt
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData {
					_id
					memberType
					memberStatus
					memberNick
					memberImage
					memberPhone
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			articleComments
			memberId
			createdAt
			updatedAt
			memberData {
				_id
				memberType
				memberStatus
				memberAuthType
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberAddress
				memberDesc
				memberWarnings
				memberBlocks
				memberProducts
				memberRank
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberWarnings
					memberBlocks
					memberProducts
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberWarnings
					memberBlocks
					memberProducts
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/
export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				followerData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberProducts
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followingData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberProducts
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         ORDER          *
 *************************/
export const GET_MY_ORDERS = gql`
	query GetMyOrders($input: OrdersInquiry!) {
		getMyOrders(input: $input) {
			_id orderTotal orderDelivery orderDeliveryType orderAddress orderStatus memberId shopId createdAt
			orderItems { _id productId itemQuantity itemPrice }
			productData { _id productName productImages }
		}
	}
`;

export const GET_EVENTS = gql`
	query GetEvents($input: EventsInquiry!) {
		getEvents(input: $input) {
			list { _id eventType eventStatus eventTitle eventDesc eventGame eventImage eventDate eventMaxParticipants eventOrganizer eventStart eventEnd eventPrize deletedAt }
			metaCounter { total }
		}
	}
`;

export const GET_MY_EVENTS = gql`
	query GetMyEvents($input: ShopEventsInquiry!) {
		getMyEvents(input: $input) {
			list { _id eventType eventStatus eventTitle eventDesc eventGame eventImage eventDate eventMaxParticipants eventOrganizer eventStart eventEnd eventPrize deletedAt }
			metaCounter { total }
		}
	}
`;

export const GET_EVENT = gql`
	query GetEvent($input: String!) {
		getEvent(eventId: $input) { _id eventType eventStatus eventTitle eventDesc eventGame eventImage eventDate eventMaxParticipants eventOrganizer eventStart eventEnd eventPrize deletedAt }
	}
`;

export const GET_MY_REGISTRATIONS = gql`
	query GetMyRegistrations($input: EventParticipantsInquiry!) {
		getMyRegistrations(input: $input) {
			list { _id eventId memberId participantStatus eventData { _id eventType eventStatus eventTitle eventDesc eventGame eventImage eventDate eventMaxParticipants eventOrganizer eventStart eventEnd eventPrize deletedAt } }
			metaCounter { total }
		}
	}
`;

export const GET_EVENT_PARTICIPANTS = gql`
	query GetEventParticipants($eventId: String!, $input: EventParticipantsInquiry!) {
		getEventParticipants(eventId: $eventId, input: $input) {
			list { _id eventId memberId participantStatus memberData { _id memberNick memberImage memberStatus } }
			metaCounter { total }
		}
	}
`;
