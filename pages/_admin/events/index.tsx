import React from 'react';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import EventBoard from '../../../libs/components/events/EventBoard';
function AdminEvents() { return <EventBoard mode="admin" />; }
export default withAdminLayout(AdminEvents);
