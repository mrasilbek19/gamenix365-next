import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Button, Card, Pagination, Stack, TextField, Typography } from '@mui/material';
import { REMOVE_COMMENT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_COMMENTS } from '../../../apollo/user/query';
import { CREATE_COMMENT, UPDATE_COMMENT } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';

export default function Comments({ targetId, group }: { targetId: string; group: 'PRODUCT' | 'ARTICLE' | 'MEMBER' }) {
	const user = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const [text, setText] = useState('');
	const [editing, setEditing] = useState('');
	const [editText, setEditText] = useState('');
	const [message, setMessage] = useState('');
	const [removeByAdmin] = useMutation(REMOVE_COMMENT_BY_ADMIN);
	const [create, { loading: creating }] = useMutation(CREATE_COMMENT);
	const [update, { loading: updating }] = useMutation(UPDATE_COMMENT);
	const { data, error, loading, refetch } = useQuery(GET_COMMENTS, { variables: { input: { page, limit: 10, sort: 'createdAt', direction: 'DESC', search: { commentRefId: targetId } } }, skip: !targetId, fetchPolicy: 'network-only' });
	const edit = async (input: any) => { try { setMessage(''); await update({ variables: { input } }); setEditing(''); await refetch(); } catch (err: any) { setMessage(err.message); } };
	return <Stack spacing={2} sx={{ width: '100%' }}><Typography variant="h5">Comments</Typography>
		{(message || error) && <Alert severity="error">{message || error?.message}</Alert>}{loading && <Typography>Loading comments…</Typography>}
		{user._id && <Stack component="form" spacing={1} onSubmit={async (e: React.FormEvent) => { e.preventDefault(); try { setMessage(''); await create({ variables: { input: { commentRefId: targetId, commentGroup: group, commentContent: text.trim() } } }); setText(''); setPage(1); await refetch(); } catch (err: any) { setMessage(err.message); } }}>
			<TextField label="Comment" value={text} inputProps={{ maxLength: 100 }} onChange={e => setText(e.target.value)} /><Button type="submit" disabled={creating || !text.trim()}>Post comment</Button>
		</Stack>}
		{data?.getComments?.list.map((comment: any) => <Card key={comment._id} sx={{ p: 2 }}><Stack spacing={1}>
			<Link href={`/member?memberId=${comment.memberId}`}>{comment.memberData?.memberNick ?? 'Member'}</Link>
			{editing === comment._id ? <><TextField value={editText} inputProps={{ maxLength: 100 }} onChange={e => setEditText(e.target.value)} /><Button disabled={updating || !editText.trim()} onClick={() => edit({ _id: comment._id, commentContent: editText.trim() })}>Save comment</Button><Button onClick={() => setEditing('')}>Cancel</Button></> : <Typography>{comment.commentContent}</Typography>}
			{user.memberType === 'ADMIN' && <Button color="error" onClick={async () => { if (!window.confirm('Permanently remove this comment?')) return; try { await removeByAdmin({ variables: { input: comment._id } }); await refetch(); } catch (err: any) { setMessage(err.message); } }}>Remove as ADMIN</Button>}
			{comment.memberId === user._id && <Stack direction="row"><Button onClick={() => { setEditing(comment._id); setEditText(comment.commentContent); }}>Edit</Button><Button color="error" disabled={updating} onClick={() => { if (window.confirm('Delete this comment?')) void edit({ _id: comment._id, commentStatus: 'DELETE' }); }}>Delete</Button></Stack>}
		</Stack></Card>)}
		<Pagination page={page} count={Math.max(1, Math.ceil((data?.getComments?.metaCounter?.[0]?.total ?? 0) / 10))} onChange={(_, value) => setPage(value)} />
	</Stack>;
}
