// ملف إدارة المستخدمين لـ EgyBook

console.log('👥 تحميل نظام المستخدمين...');

const UserSystem = {
    // جلب المستخدم الحالي
    getCurrentUser: function() {
        try {
            const user = localStorage.getItem('current_user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('خطأ في جلب بيانات المستخدم:', error);
            return null;
        }
    },
    
    // تحديث بيانات المستخدم
    updateUser: function(updatedData) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) return false;
            
            // تحديث البيانات
            const updatedUser = { ...currentUser, ...updatedData };
            
            // حفظ في localStorage
            localStorage.setItem('current_user', JSON.stringify(updatedUser));
            
            // تحديث في النظام العام
            this.updateUserInSystem(updatedUser);
            
            console.log('✅ تم تحديث بيانات المستخدم');
            return true;
        } catch (error) {
            console.error('خطأ في تحديث بيانات المستخدم:', error);
            return false;
        }
    },
    
    // تحديث المستخدم في النظام
    updateUserInSystem: function(user) {
        try {
            const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
            const users = systemData.users || [];
            
            // البحث عن المستخدم وتحديثه
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex] = user;
                systemData.users = users;
                localStorage.setItem('egybook_system', JSON.stringify(systemData));
            }
        } catch (error) {
            console.error('خطأ في تحديث المستخدم في النظام:', error);
        }
    },
    
    // جلب جميع المستخدمين
    getAllUsers: function() {
        try {
            const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
            return systemData.users || [];
        } catch (error) {
            console.error('خطأ في جلب جميع المستخدمين:', error);
            return [];
        }
    },
    
    // جلب مستخدمين محافظة معينة
    getUsersByGovernorate: function(governorate) {
        const users = this.getAllUsers();
        return users.filter(user => user.governorate === governorate);
    },
    
    // جلب عدد المستخدمين
    getUsersCount: function() {
        const users = this.getAllUsers();
        return {
            total: users.length,
            byGovernorate: this.getUsersCountByGovernorate(),
            active: users.filter(u => u.status === 'active').length,
            pending: users.filter(u => u.status === 'pending').length
        };
    },
    
    // جلب عدد المستخدمين حسب المحافظة
    getUsersCountByGovernorate: function() {
        const users = this.getAllUsers();
        const counts = {};
        
        users.forEach(user => {
            counts[user.governorate] = (counts[user.governorate] || 0) + 1;
        });
        
        return counts;
    },
    
    // البحث عن مستخدم
    searchUsers: function(query) {
        const users = this.getAllUsers();
        const searchTerm = query.toLowerCase();
        
        return users.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.governorate.toLowerCase().includes(searchTerm)
        );
    },
    
    // حذف المستخدم
    deleteUser: function(userId) {
        try {
            const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
            const users = systemData.users || [];
            
            // البحث عن المستخدم وحذفه
            const filteredUsers = users.filter(user => user.id !== userId);
            systemData.users = filteredUsers;
            
            localStorage.setItem('egybook_system', JSON.stringify(systemData));
            
            console.log(`✅ تم حذف المستخدم ${userId}`);
            return true;
        } catch (error) {
            console.error('خطأ في حذف المستخدم:', error);
            return false;
        }
    },
    
    // تغيير حالة المستخدم
    changeUserStatus: function(userId, newStatus) {
        try {
            const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
            const users = systemData.users || [];
            
            // البحث عن المستخدم وتحديث حالته
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                users[userIndex].status = newStatus;
                systemData.users = users;
                localStorage.setItem('egybook_system', JSON.stringify(systemData));
                
                console.log(`✅ تم تغيير حالة المستخدم ${userId} إلى ${newStatus}`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('خطأ في تغيير حالة المستخدم:', error);
            return false;
        }
    },
    
    // التحقق من صلاحيات المستخدم
    checkPermission: function(user, permission) {
        const permissions = {
            'user': ['view_posts', 'create_posts', 'comment', 'like', 'share'],
            'moderator': ['manage_posts', 'manage_users', 'view_reports', 'ban_users'],
            'admin': ['all']
        };
        
        const userRole = user.role || 'user';
        const userPermissions = permissions[userRole] || [];
        
        return permission === 'all' ? userRole === 'admin' : userPermissions.includes(permission);
    },
    
    // إضافة صديق
    addFriend: function(userId, friendId) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) return false;
            
            // إضافة للقائمة المحلية
            if (!currentUser.friends) {
                currentUser.friends = [];
            }
            
            if (!currentUser.friends.includes(friendId)) {
                currentUser.friends.push(friendId);
                this.updateUser({ friends: currentUser.friends });
            }
            
            return true;
        } catch (error) {
            console.error('خطأ في إضافة صديق:', error);
            return false;
        }
    },
    
    // جلب أصدقاء المستخدم
    getUserFriends: function(userId) {
        const allUsers = this.getAllUsers();
        const user = allUsers.find(u => u.id === userId);
        
        if (!user || !user.friends) return [];
        
        return allUsers.filter(u => user.friends.includes(u.id));
    }
};

// جعل النظام متاحًا عالميًا
window.UserSystem = UserSystem;

console.log('✅ نظام المستخدمين جاهز للاستخدام');