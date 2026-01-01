// نظام التعليقات المتقدم لـ EgyBook

console.log('💬 تحميل نظام التعليقات...');

const CommentSystem = {
    // جلب تعليقات المنشور
    getPostComments: function(postId) {
        const posts = PostSystem.getAllPosts();
        const post = posts.find(p => p.id === postId);
        return post ? post.comments || [] : [];
    },
    
    // إضافة رد على تعليق
    addReply: function(postId, commentId, replyText) {
        try {
            const currentUser = UserSystem.getCurrentUser();
            if (!currentUser) return null;
            
            if (!replyText || replyText.trim() === '') {
                EgyBook.showMessage('اكتب ردًا أولاً', 'error');
                return null;
            }
            
            const reply = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                commentId: commentId,
                userId: currentUser.id,
                userName: currentUser.name,
                userAvatar: PostSystem.getUserAvatar(currentUser.name),
                content: replyText.trim(),
                likes: [],
                createdAt: new Date().toISOString()
            };
            
            const posts = PostSystem.getAllPosts();
            const postIndex = posts.findIndex(p => p.id === postId);
            
            if (postIndex === -1) return null;
            
            const commentIndex = posts[postIndex].comments.findIndex(c => c.id === commentId);
            if (commentIndex === -1) return null;
            
            if (!posts[postIndex].comments[commentIndex].replies) {
                posts[postIndex].comments[commentIndex].replies = [];
            }
            
            posts[postIndex].comments[commentIndex].replies.push(reply);
            posts[postIndex].updatedAt = new Date().toISOString();
            
            PostSystem.saveAllPosts(posts);
            
            EgyBook.showMessage('تم إضافة الرد بنجاح!', 'success');
            return reply;
        } catch (error) {
            console.error('خطأ في إضافة رد:', error);
            EgyBook.showMessage('حدث خطأ في إضافة الرد', 'error');
            return null;
        }
    },
    
    // إعجاب بتعليق
    likeComment: function(postId, commentId) {
        try {
            const currentUser = UserSystem.getCurrentUser();
            if (!currentUser) return false;
            
            const posts = PostSystem.getAllPosts();
            const postIndex = posts.findIndex(p => p.id === postId);
            
            if (postIndex === -1) return false;
            
            const commentIndex = posts[postIndex].comments.findIndex(c => c.id === commentId);
            if (commentIndex === -1) return false;
            
            const comment = posts[postIndex].comments[commentIndex];
            const likeIndex = comment.likes.findIndex(like => like.userId === currentUser.id);
            
            if (likeIndex === -1) {
                // إضافة إعجاب
                comment.likes.push({
                    userId: currentUser.id,
                    userName: currentUser.name,
                    timestamp: new Date().toISOString()
                });
            } else {
                // إزالة الإعجاب
                comment.likes.splice(likeIndex, 1);
            }
            
            posts[postIndex].comments[commentIndex] = comment;
            PostSystem.saveAllPosts(posts);
            
            return true;
        } catch (error) {
            console.error('خطأ في إعجاب التعليق:', error);
            return false;
        }
    },
    
    // حذف تعليق
    deleteComment: function(postId, commentId) {
        try {
            const currentUser = UserSystem.getCurrentUser();
            if (!currentUser) return false;
            
            const posts = PostSystem.getAllPosts();
            const postIndex = posts.findIndex(p => p.id === postId);
            
            if (postIndex === -1) return false;
            
            const commentIndex = posts[postIndex].comments.findIndex(c => c.id === commentId);
            if (commentIndex === -1) return false;
            
            const comment = posts[postIndex].comments[commentIndex];
            
            // التحقق من الصلاحيات
            if (comment.userId !== currentUser.id && currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
                EgyBook.showMessage('ليس لديك صلاحية حذف هذا التعليق', 'error');
                return false;
            }
            
            posts[postIndex].comments.splice(commentIndex, 1);
            PostSystem.saveAllPosts(posts);
            
            EgyBook.showMessage('تم حذف التعليق بنجاح', 'success');
            return true;
        } catch (error) {
            console.error('خطأ في حذف التعليق:', error);
            return false;
        }
    },
    
    // عرض كل التعليقات
    showAllComments: function(postId) {
        const posts = PostSystem.getAllPosts();
        const post = posts.find(p => p.id === postId);
        
        if (!post) return;
        
        // إنشاء نافذة التعليقات
        const modal = this.createCommentsModal(post);
        document.body.appendChild(modal);
    },
    
    // إنشاء نافذة التعليقات
    createCommentsModal: function(post) {
        const modal = document.createElement('div');
        modal.className = 'comments-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>التعليقات (${post.comments.length})</h3>
                    <button class="close-modal">✕</button>
                </div>
                <div class="modal-body">
                    ${post.comments.map(comment => this.renderFullComment(comment)).join('')}
                </div>
                <div class="modal-footer">
                    <div class="add-comment-modal">
                        <input type="text" 
                               class="comment-input-modal" 
                               placeholder="اكتب تعليقًا..."
                               data-post-id="${post.id}">
                        <button class="send-comment-modal" data-post-id="${post.id}">إرسال</button>
                    </div>
                </div>
            </div>
        `;
        
        // أحداث الإغلاق
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());
        
        return modal;
    },
    
    // عرض تعليق كامل
    renderFullComment: function(comment) {
        return `
            <div class="full-comment" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-avatar">${comment.userAvatar}</div>
                    <div class="comment-info">
                        <strong>${comment.userName}</strong>
                        <small>${PostSystem.getTimeAgo(comment.createdAt)}</small>
                    </div>
                </div>
                <div class="comment-body">
                    <p>${comment.content}</p>
                    <div class="comment-actions">
                        <button class="like-comment-btn" data-comment-id="${comment.id}">
                            👍 ${comment.likes.length}
                        </button>
                        <button class="reply-btn" data-comment-id="${comment.id}">
                            💬 رد
                        </button>
                    </div>
                </div>
                
                ${comment.replies && comment.replies.length > 0 ? `
                    <div class="comment-replies">
                        ${comment.replies.map(reply => this.renderReply(reply)).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    },
    
    // عرض رد
    renderReply: function(reply) {
        return `
            <div class="reply" data-reply-id="${reply.id}">
                <div class="reply-header">
                    <div class="reply-avatar">${reply.userAvatar}</div>
                    <div class="reply-info">
                        <strong>${reply.userName}</strong>
                        <small>${PostSystem.getTimeAgo(reply.createdAt)}</small>
                    </div>
                </div>
                <div class="reply-body">
                    <p>${reply.content}</p>
                </div>
            </div>
        `;
    }
};

// جعل النظام متاحًا عالميًا
window.CommentSystem = CommentSystem;

console.log('✅ نظام التعليقات جاهز للاستخدام');