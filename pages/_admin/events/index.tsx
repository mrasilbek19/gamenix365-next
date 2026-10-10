import React from 'react';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import EventBoard from '../../../libs/components/events/EventBoard';
function AdminEvents() {
	return (
		<div className={'admin-events-page'}>
			<EventBoard mode="admin" />
		</div>
	);
}
export default withAdminLayout(AdminEvents);
