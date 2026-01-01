// نظام المنشورات والتعليقات لـ EgyBook

console.log('📝 تحميل نظام المنشورات...');

const PostSystem = {
    // إنشاء منشور جديد
    createPost: function(content, options = {}) {
        try {
            const currentUser = UserSystem.getCurrentUser();
            if (!currentUser) {
                EgyBook.showMessage('يجب تسجيل الدخول أولاً', 'error');
                return null;
            }
            
            const post = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                userId: currentUser.id,
                userName: currentUser.name,
                userAvatar: currentUser.profileImage || this.getUserAvatar(currentUser.name),
                governorate: currentUser.governorate,
                content: content.trim(),
                images: options.images || [],
                videos: options.videos || [],
                type: options.type || 'post', // post, ad, event, job
                isSponsored: options.isSponsored || false,
                sponsoredRegions: options.sponsoredRegions || [],
                likes: [],
                comments: [],
                shares: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                privacy: options.privacy || 'public', // public, community, friends
                status: 'active'
            };
            
            // حفظ المنشور
            this.savePost(post);
            
            // تحديث إحصائيات المستخدم
            UserSystem.updateUser({
                postCount: (currentUser.postCount || 0) + 1
            });
            
            console.log('✅ تم إنشاء المنشور:', post.id);
            EgyBook.showMessage('تم نشر المنشور بنجاح!', 'success');
            
            return post;
        } catch (error) {
            console.error('خطأ في إنشاء المنشور:', error);
            EgyBook.showMessage('حدث خطأ في نشر المنشور', 'error');
            return null;
        }
    },
    
    // حفظ المنشور في النظام
    savePost: function(post) {
        try {
            const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
            
            if (!systemData.posts) {
                systemData.posts = [];
            }
            
            systemData.posts.unshift(post); // إضافة في البداية
            localStorage.setItem('egybook_system', JSON.stringify(systemData));
            
            // تحديث واجهة المستخدم
            this.updateFeed();
            
            return true;
        } catch (error) {
            console.error('خطأ في حفظ المنشور:', error);
            return false;
        }
    },
    
    // جلب جميع المنشورات
    getAllPosts: function() {
        try {
            const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
            return systemData.posts || [];
        } catch (error) {
            console.error('خطأ في جلب المنشورات:', error);
            return [];
        }
    },
    
    // جلب منشورات محافظة معينة
    getPostsByGovernorate: function(governorate) {
        const posts = this.getAllPosts();
        const currentUser = UserSystem.getCurrentUser();
        
        return posts.filter(post => {
            // المنشورات العامة
            if (post.privacy === 'public') return true;
            
            // منشورات المجتمع (المحافظة)
            if (post.privacy === 'community') {
                return post.governorate === governorate;
            }
            
            // منشورات الأصدقاء
            if (post.privacy === 'friends') {
                return currentUser && 
                       (post.userId === currentUser.id || 
                        (currentUser.friends && currentUser.friends.includes(post.userId)));
            }
            
            return false;
        });
    },
    
    // جلب منشورات المستخدم
    getUserPosts: function(userId) {
        const posts = this.getAllPosts();
        return posts.filter(post => post.userId === userId);
    },
    
    // إضافة إعجاب
    likePost: function(postId) {
        try {
            const currentUser = UserSystem.getCurrentUser();
            if (!currentUser) return false;
            
            const posts = this.getAllPosts();
            const postIndex = posts.findIndex(p => p.id === postId);
            
            if (postIndex === -1) return false;
            
            const post = posts[postIndex];
            const likeIndex = post.likes.findIndex(like => like.userId === currentUser.id);
            
            if (likeIndex === -1) {
                // إضافة إعجاب
                post.likes.push({
                    userId: currentUser.id,
                    userName: currentUser.name,
                    timestamp: new Date().toISOString()
                });
            } else {
                // إزالة الإعجاب
                post.likes.splice(likeIndex, 1);
            }
            
            post.updatedAt = new Date().toISOString();
            posts[postIndex] = post;
            
            // حفظ التغييرات
            this.saveAllPosts(posts);
            
            // تحديث الواجهة
            this.updatePostLikes(postId, post.likes.length);
            
            return true;
        } catch (error) {
            console.error('خطأ في إضافة إعجاب:', error);
            return false;
        }
    },
    
    // إضافة تعليق
    addComment: function(postId, commentText) {
        try {
            const currentUser = UserSystem.getCurrentUser();
            if (!currentUser) return null;
            
            if (!commentText || commentText.trim() === '') {
                EgyBook.showMessage('اكتب تعليقًا أولاً', 'error');
                return null;
            }
            
            const comment = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                postId: postId,
                userId: currentUser.id,
                userName: currentUser.name,
                userAvatar: this.getUserAvatar(currentUser.name),
                content: commentText.trim(),
                likes: [],
                replies: [],
                createdAt: new Date().toISOString()
            };
            
            const posts = this.getAllPosts();
            const postIndex = posts.findIndex(p => p.id === postId);
            
            if (postIndex === -1) return null;
            
            if (!posts[postIndex].comments) {
                posts[postIndex].comments = [];
            }
            
            posts[postIndex].comments.push(comment);
            posts[postIndex].updatedAt = new Date().toISOString();
            
            this.saveAllPosts(posts);
            
            // تحديث الواجهة
            this.updatePostComments(postId);
            
            EgyBook.showMessage('تم إضافة التعليق بنجاح!', 'success');
            
            return comment;
        } catch (error) {
            console.error('خطأ في إضافة تعليق:', error);
            EgyBook.showMessage('حدث خطأ في إضافة التعليق', 'error');
            return null;
        }
    },
    
    // مشاركة المنشور
    sharePost: function(postId) {
        try {
            const currentUser = UserSystem.getCurrentUser();
            if (!currentUser) return false;
            
            const posts = this.getAllPosts();
            const postIndex = posts.findIndex(p => p.id === postId);
            
            if (postIndex === -1) return false;
            
            posts[postIndex].shares = (posts[postIndex].shares || 0) + 1;
            posts[postIndex].updatedAt = new Date().toISOString();
            
            this.saveAllPosts(posts);
            
            // إنشاء منشور مشاركة
            const originalPost = posts[postIndex];
            const shareContent = `🔄 ${currentUser.name} شارك منشور ${originalPost.userName}\n\n${originalPost.content.substring(0, 100)}...`;
            
            this.createPost(shareContent, {
                type: 'share',
                originalPostId: postId
            });
            
            EgyBook.showMessage('تمت المشاركة بنجاح!', 'success');
            
            return true;
        } catch (error) {
            console.error('خطأ في مشاركة المنشور:', error);
            return false;
        }
    },
    
    // حفظ جميع المنشورات
    saveAllPosts: function(posts) {
        try {
            const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
            systemData.posts = posts;
            localStorage.setItem('egybook_system', JSON.stringify(systemData));
            
            return true;
        } catch (error) {
            console.error('خطأ في حفظ المنشورات:', error);
            return false;
        }
    },
    
    // تحديث التغذية
    updateFeed: function() {
        const feedContainer = document.getElementById('feedPosts');
        if (!feedContainer) return;
        
        const currentUser = UserSystem.getCurrentUser();
        if (!currentUser) return;
        
        const posts = this.getPostsByGovernorate(currentUser.governorate);
        
        if (posts.length === 0) {
            feedContainer.innerHTML = `
                <div class="no-posts">
                    <div class="no-posts-icon">📝</div>
                    <h3>لا توجد منشورات بعد</h3>
                    <p>كن أول من ينشر في مجتمع ${currentUser.governorate}!</p>
                </div>
            `;
            return;
        }
        
        feedContainer.innerHTML = posts.map(post => this.renderPost(post)).join('');
        
        // إضافة أحداث للأزرار
        this.attachPostEvents();
    },
    
    // عرض المنشور
    renderPost: function(post) {
        const isLiked = post.likes.some(like => {
            const currentUser = UserSystem.getCurrentUser();
            return currentUser && like.userId === currentUser.id;
        });
        
        const timeAgo = this.getTimeAgo(post.createdAt);
        
        return `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-avatar">${post.userAvatar}</div>
                    <div class="post-author">
                        <h4>${post.userName}</h4>
                        <div class="post-meta">
                            <span class="post-time">${timeAgo}</span>
                            <span class="post-location">📍 ${post.governorate}</span>
                            ${post.isSponsored ? '<span class="sponsored-badge">🤑 إعلان ممول</span>' : ''}
                        </div>
                    </div>
                </div>
                
                <div class="post-content">
                    <p>${this.formatContent(post.content)}</p>
                    
                    ${post.images && post.images.length > 0 ? `
                        <div class="post-images">
                            ${post.images.slice(0, 3).map((img, index) => `
                                <img src="${img}" alt="صورة ${index + 1}" class="post-image">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="post-stats">
                    <span class="stat">👍 ${post.likes.length} إعجاب</span>
                    <span class="stat">💬 ${post.comments.length} تعليق</span>
                    <span class="stat">🔄 ${post.shares} مشاركة</span>
                </div>
                
                <div class="post-engagement">
                    <button class="engagement-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
                        ${isLiked ? '👍 معجب به' : '👍 أعجبني'}
                    </button>
                    <button class="engagement-btn comment-btn" data-post-id="${post.id}">
                        💬 تعليق
                    </button>
                    <button class="engagement-btn share-btn" data-post-id="${post.id}">
                        🔄 مشاركة
                    </button>
                </div>
                
                ${post.comments.length > 0 ? `
                    <div class="post-comments">
                        <h5>التعليقات (${post.comments.length})</h5>
                        ${post.comments.slice(0, 3).map(comment => `
                            <div class="comment">
                                <div class="comment-avatar">${comment.userAvatar}</div>
                                <div class="comment-content">
                                    <strong>${comment.userName}</strong>
                                    <p>${comment.content}</p>
                                    <small>${this.getTimeAgo(comment.createdAt)}</small>
                                </div>
                            </div>
                        `).join('')}
                        ${post.comments.length > 3 ? `
                            <button class="view-all-comments" data-post-id="${post.id}">
                                عرض جميع التعليقات (${post.comments.length})
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
                
                <div class="add-comment">
                    <input type="text" 
                           class="comment-input" 
                           placeholder="اكتب تعليقًا..." 
                           data-post-id="${post.id}">
                    <button class="send-comment" data-post-id="${post.id}">إرسال</button>
                </div>
            </div>
        `;
    },
    
    // إضافة أحداث للمنشورات
    attachPostEvents: function() {
        // أزرار الإعجاب
        document.querySelectorAll('.like-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const postId = e.target.dataset.postId;
                this.likePost(postId);
            });
        });
        
        // أزرار التعليق
        document.querySelectorAll('.comment-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const postId = e.target.dataset.postId;
                const input = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
                input.focus();
            });
        });
        
        // أزرار المشاركة
        document.querySelectorAll('.share-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const postId = e.target.dataset.postId;
                this.sharePost(postId);
            });
        });
        
        // إرسال التعليقات
        document.querySelectorAll('.send-comment').forEach(button => {
            button.addEventListener('click', (e) => {
                const postId = e.target.dataset.postId;
                const input = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
                if (input.value.trim()) {
                    this.addComment(postId, input.value);
                    input.value = '';
                }
            });
        });
        
        // Enter لإرسال التعليق
        document.querySelectorAll('.comment-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const postId = e.target.dataset.postId;
                    if (input.value.trim()) {
                        this.addComment(postId, input.value);
                        input.value = '';
                    }
                }
            });
        });
    },
    
    // تحديث عدد الإعجابات
    updatePostLikes: function(postId, likeCount) {
        const likeBtn = document.querySelector(`.like-btn[data-post-id="${postId}"]`);
        const statElement = document.querySelector(`[data-post-id="${postId}"] .post-stats .stat:nth-child(1)`);
        
        if (likeBtn) {
            const currentUser = UserSystem.getCurrentUser();
            const posts = this.getAllPosts();
            const post = posts.find(p => p.id === postId);
            const isLiked = post && post.likes.some(like => like.userId === currentUser.id);
            
            likeBtn.textContent = isLiked ? '👍 معجب به' : '👍 أعجبني';
            likeBtn.classList.toggle('liked', isLiked);
        }
        
        if (statElement) {
            statElement.textContent = `👍 ${likeCount} إعجاب`;
        }
    },
    
    // تحديث التعليقات
    updatePostComments: function(postId) {
        const posts = this.getAllPosts();
        const post = posts.find(p => p.id === postId);
        
        if (!post) return;
        
        const commentsSection = document.querySelector(`[data-post-id="${postId}"] .post-comments`);
        const statsElement = document.querySelector(`[data-post-id="${postId}"] .post-stats .stat:nth-child(2)`);
        
        if (statsElement) {
            statsElement.textContent = `💬 ${post.comments.length} تعليق`;
        }
        
        if (commentsSection) {
            commentsSection.innerHTML = `
                <h5>التعليقات (${post.comments.length})</h5>
                ${post.comments.slice(0, 3).map(comment => `
                    <div class="comment">
                        <div class="comment-avatar">${comment.userAvatar}</div>
                        <div class="comment-content">
                            <strong>${comment.userName}</strong>
                            <p>${comment.content}</p>
                            <small>${this.getTimeAgo(comment.createdAt)}</small>
                        </div>
                    </div>
                `).join('')}
                ${post.comments.length > 3 ? `
                    <button class="view-all-comments" data-post-id="${postId}">
                        عرض جميع التعليقات (${post.comments.length})
                    </button>
                ` : ''}
            `;
        }
    },
    
    // صورة رمزية افتراضية
    getUserAvatar: function(name) {
        const colors = ['#1e3a8a', '#ce1126', '#d4af37', '#27ae60', '#8e44ad'];
        const color = colors[name.length % colors.length];
        const letter = name.charAt(0).toUpperCase();
        
        return `<div style="width: 40px; height: 40px; background: ${color}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">${letter}</div>`;
    },
    
    // تنسيق النص
    formatContent: function(text) {
        // تحويل الروابط
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // تحويل الهاشتاجات
        text = text.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
        
        // تحويل التاغات
        text = text.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
        
        // حفظ الأسطر
        text = text.replace(/\n/g, '<br>');
        
        return text;
    },
    
    // حساب الوقت المنقضي
    getTimeAgo: function(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (seconds < 60) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        if (days < 7) return `منذ ${days} يوم`;
        if (days < 30) return `منذ ${Math.floor(days / 7)} أسبوع`;
        if (days < 365) return `منذ ${Math.floor(days / 30)} شهر`;
        
        return `منذ ${Math.floor(days / 365)} سنة`;
    },
    
    // حذف المنشور
    deletePost: function(postId) {
        try {
            const currentUser = UserSystem.getCurrentUser();
            if (!currentUser) return false;
            
            const posts = this.getAllPosts();
            const postIndex = posts.findIndex(p => p.id === postId);
            
            if (postIndex === -1) return false;
            
            const post = posts[postIndex];
            
            // التحقق من الصلاحيات
            if (post.userId !== currentUser.id && currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
                EgyBook.showMessage('ليس لديك صلاحية حذف هذا المنشور', 'error');
                return false;
            }
            
            posts.splice(postIndex, 1);
            this.saveAllPosts(posts);
            
            // إزالة من الواجهة
            const postElement = document.querySelector(`[data-post-id="${postId}"]`);
            if (postElement) {
                postElement.remove();
            }
            
            EgyBook.showMessage('تم حذف المنشور بنجاح', 'success');
            return true;
        } catch (error) {
            console.error('خطأ في حذف المنشور:', error);
            return false;
        }
    },
    
    // الإبلاغ عن منشور
    reportPost: function(postId, reason) {
        try {
            const currentUser = UserSystem.getCurrentUser();
            if (!currentUser) return false;
            
            const report = {
                id: Date.now(),
                postId: postId,
                reporterId: currentUser.id,
                reporterName: currentUser.name,
                reason: reason,
                reportedAt: new Date().toISOString(),
                status: 'pending'
            };
            
            // حفظ البلاغ
            const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
            if (!systemData.reports) {
                systemData.reports = [];
            }
            systemData.reports.push(report);
            localStorage.setItem('egybook_system', JSON.stringify(systemData));
            
            EgyBook.showMessage('تم الإبلاغ عن المنشور بنجاح', 'success');
            return true;
        } catch (error) {
            console.error('خطأ في الإبلاغ عن المنشور:', error);
            return false;
        }
    },
    
    // التهيئة
    init: function() {
        console.log('تهيئة نظام المنشورات...');
        
        // تحديث التغذية عند تحميل الصفحة
        if (document.getElementById('feedPosts')) {
            this.updateFeed();
        }
        
        // إعداد زر النشر
        const postButton = document.querySelector('.post-btn.primary');
        if (postButton) {
            postButton.addEventListener('click', () => {
                const textarea = document.querySelector('.post-input');
                if (textarea && textarea.value.trim()) {
                    this.createPost(textarea.value);
                    textarea.value = '';
                } else {
                    EgyBook.showMessage('اكتب شيئًا للنشر أولاً', 'error');
                }
            });
        }
    }
};

// التهيئة التلقائية
document.addEventListener('DOMContentLoaded', () => PostSystem.init());

// جعل النظام متاحًا عالميًا
window.PostSystem = PostSystem;

console.log('✅ نظام المنشورات جاهز للاستخدام');