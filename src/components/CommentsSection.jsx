import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { MessageSquare, ThumbsUp, Pin, Send, MoreVertical, Reply } from 'lucide-react';
import {
  getComments, createComment, createReply, likeComment, unlikeComment,
} from '../lib/api.js';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function CommentsSection({ lessonId, user }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [socket, setSocket] = useState(null);

  // Initialize Socket.IO
  useEffect(() => {
    const socketInstance = io(SOCKET_URL);
    setSocket(socketInstance);

    // Join lesson room
    socketInstance.emit('join-lesson', lessonId);

    // Listen for real-time updates
    socketInstance.on('comment-created', (comment) => {
      setComments(prev => [comment, ...prev]);
    });

    socketInstance.on('comment-updated', (comment) => {
      setComments(prev => prev.map(c => c.id === comment.id ? comment : c));
    });

    socketInstance.on('comment-deleted', ({ id }) => {
      setComments(prev => prev.filter(c => c.id !== id));
    });

    socketInstance.on('reply-created', (reply) => {
      setComments(prev => prev.map(c => 
        c.id === reply.commentId 
          ? { ...c, replies: [...c.replies, reply] }
          : c
      ));
    });

    socketInstance.on('reply-updated', (reply) => {
      setComments(prev => prev.map(c => 
        c.id === reply.commentId 
          ? { ...c, replies: c.replies.map(r => r.id === reply.id ? reply : r) }
          : c
      ));
    });

    socketInstance.on('reply-deleted', ({ id }) => {
      setComments(prev => prev.map(c => 
        c.id === replyingTo?.commentId 
          ? { ...c, replies: c.replies.filter(r => r.id !== id) }
          : c
      ));
    });

    socketInstance.on('comment-liked', ({ commentId, likeCount }) => {
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, _count: { ...c._count, likes: likeCount } }
          : c
      ));
    });

    socketInstance.on('comment-unliked', ({ commentId, likeCount }) => {
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, _count: { ...c._count, likes: likeCount } }
          : c
      ));
    });

    return () => {
      socketInstance.emit('leave-lesson', lessonId);
      socketInstance.disconnect();
    };
  }, [lessonId]);

  // Load comments
  useEffect(() => {
    if (!lessonId) return;
    
    setLoading(true);
    getComments(lessonId)
      .then(data => setComments(data))
      .catch(err => console.error('Failed to load comments:', err))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      await createComment(lessonId, user.id, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !user || !replyingTo) return;

    try {
      await createReply(replyingTo.id, user.id, replyText);
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to create reply:', error);
    }
  };

  const handleLike = async (commentId) => {
    if (!user) return;
    
    try {
      if (comments.find(c => c.id === commentId)?.isLikedByUser) {
        await unlikeComment(commentId, user.id);
      } else {
        await likeComment(commentId, user.id);
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-slate-400">Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-navy">
        <MessageSquare size={20} />
        Comments ({comments.length})
      </h3>

      {/* New Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full rounded-lg border border-slate-200 p-3 focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="btn btn-primary flex items-center gap-2"
            >
              <Send size={16} />
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-6 text-slate-500">Please log in to comment.</p>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-slate-400">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="rounded-lg bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal text-white font-semibold">
                  {comment.user.fullName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-navy">
                      {comment.user.fullName || 'User'}
                    </span>
                    {comment.user.isInstructor && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        Instructor
                      </span>
                    )}
                    {comment.isPinned && (
                      <Pin size={14} className="text-amber-600" />
                    )}
                    <span className="text-xs text-slate-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-700">{comment.content}</p>
                  
                  <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`flex items-center gap-1 hover:text-teal ${
                        comment.isLikedByUser ? 'text-teal' : ''
                      }`}
                    >
                      <ThumbsUp size={16} />
                      {comment._count.likes}
                    </button>
                    <button
                      onClick={() => setReplyingTo(comment)}
                      className="flex items-center gap-1 hover:text-teal"
                    >
                      <Reply size={16} />
                      Reply
                    </button>
                  </div>

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-4 space-y-3 pl-4 border-l-2 border-slate-200">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-sm font-semibold">
                            {reply.user.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-navy">
                                {reply.user.fullName || 'User'}
                              </span>
                              {reply.user.isInstructor && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                  Instructor
                                </span>
                              )}
                              <span className="text-xs text-slate-400">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo?.id === comment.id && (
                    <form onSubmit={handleSubmitReply} className="mt-4">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Replying to ${comment.user.fullName || 'User'}...`}
                        rows={2}
                        className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          type="submit"
                          disabled={!replyText.trim()}
                          className="btn btn-primary text-sm"
                        >
                          Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="btn btn-ghost text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
