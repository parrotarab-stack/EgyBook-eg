// نظام المجتمعات (27 محافظة) لـ EgyBook
console.log('🏛️ تحميل نظام المجتمعات...');

const CommunitiesSystem = {
    // قائمة المحافظات المصرية
    governorates: [
        'القاهرة', 'الإسكندرية', 'بورسعيد', 'السويس', 'دمياط', 'الدقهلية',
        'الشرقية', 'القليوبية', 'كفر الشيخ', 'الغربية', 'المنوفية',
        'البحيرة', 'الإسماعيلية', 'الجيزة', 'بني سويف', 'الفيوم',
        'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان',
        'البحر الأحمر', 'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء'
    ],
    
    // إنشاء مجتمع جديد
    createCommunity: function(governorate) {
        try {
            if (!this.governorates.includes(governorate)) {
                console.error('المحافظة غير موجودة:', governorate);
                return null;
            }
            
            const community = {
                id: this.governorates.indexOf(governorate) + 1,
                name: governorate,
                governorate: governorate,
                members: [],
                posts: [],
                events: [],
                ads: [],
                createdAt: new Date().toISOString(),
                status: 'active',
                description: this.getGovernorateDescription(governorate),
                flag: this.getGovernorateFlag(governorate),
                color: this.getGovernorateColor(governorate),
                rules: this.getDefaultRules()
            };
            
            // حفظ المجتمع
            this.saveCommunity(community);
            
            console.log(`✅ تم إنشاء مجتمع: ${governorate}`);
            return community;
            
        } catch (error) {
            console.error('خطأ في إنشاء المجتمع:', error);
            return null;
        }
    },
    
    // إنشاء جميع المجتمعات
    createAllCommunities: function() {
        console.log('جاري إنشاء جميع المجتمعات...');
        
        this.governorates.forEach(governorate => {
            this.createCommunity(governorate);
        });
        
        console.log(`✅ تم إنشاء ${this.governorates.length} مجتمع`);
    },
    
    // جلب وصف المحافظة
    getGovernorateDescription: function(governorate) {
        const descriptions = {
            'القاهرة': 'عاصمة مصر وأكبر مدينة عربية. مدينة الألف مئذنة وقلب مصر النابض.',
            'الإسكندرية': 'عروس البحر المتوسط. مدينة الثقافة والفنون والتاريخ.',
            'الجيزة': 'موطن الأهرامات وأبو الهول. بوابة التاريخ الفرعوني.',
            'أسوان': 'بوابة أفريقيا. مدينة الذهب وأجمل شتاء في مصر.',
            'الأقصر': 'أكبر متحف مفتوح في العالم. مدينة المعابد والآثار.',
            'البحر الأحمر': 'عاصمة السياحة البحرية. جنة الغواصين والمنتجعات.',
            'الوادي الجديد': 'أكبر محافظة مصرية. واحات الصحراء الغربية.',
            'شمال سيناء': 'بوابة مصر الشرقية. أرض الفيروز والبطولات.',
            'جنوب سيناء': 'جبل موسى وكاترين. أرض الوادي المقدس.',
            'دمياط': 'مدينة النخيل والجميز. عاصمة صناعة الأثاث.'
        };
        
        return descriptions[governorate] || `مجتمع محافظة ${governorate}. انضم لأبناء محافظتك وتواصل معهم.`;
    },
    
    // جلب علم المحافظة
    getGovernorateFlag: function(governorate) {
        const flags = {
            'القاهرة': '🏙️',
            'الإسكندرية': '🌊',
            'الجيزة': '🐫',
            'أسوان': '☀️',
            'الأقصر': '🏛️',
            'البحر الأحمر': '🐠',
            'الوادي الجديد': '🏜️',
            'شمال سيناء': '🛡️',
            'جنوب سيناء': '⛰️',
            'دمياط': '🌴',
            'بورسعيد': '⚓',
            'السويس': '🚢',
            'الدقهلية': '🌾',
            'الشرقية': '🚜',
            'القليوبية': '🏭',
            'كفر الشيخ': '🐟',
            'الغربية': '🐄',
            'المنوفية': '📚',
            'البحيرة': '🌅',
            'الإسماعيلية': '🌉',
            'بني سويف': '🧵',
            'الفيوم': '💧',
            'المنيا': '📜',
            'أسيوط': '🎓',
            'سوهاج': '⚕️',
            'قنا': '🏺',
            'مطروح': '🏖️'
        };
        
        return flags[governorate] || '🏛️';
    },
    
    // جلب لون المحافظة
    getGovernorateColor: function(governorate) {
        const colors = {
            'القاهرة': '#ce1126', // أحمر
            'الإسكندرية': '#1e3a8a', // أزرق
            'الجيزة': '#d4af37', // ذهبي
            'أسوان': '#e74c3c', // أحمر برتقالي
            'الأقصر': '#8e44ad', // بنفسجي
            'البحر الأحمر': '#3498db', // أزرق فاتح
            'الوادي الجديد': '#e67e22', // برتقالي
            'شمال سيناء': '#27ae60', // أخضر
            'جنوب سيناء': '#2ecc71', // أخضر فاتح
            'دمياط': '#16a085' // فيروزي
        };
        
        return colors[governorate] || '#2d2424';
    },
    
    // القواعد الافتراضية
    getDefaultRules: function() {
        return [
            'احترام جميع أبناء المحافظة',
            'عدم نشر محتوى مسيء',
            'الالتزام بالآداب العامة',
            'عدم نشر إعلانات غير مصرح بها',
            'احترام الرأي والرأي الآخر',
            'الإبلاغ عن أي مخالفة'
        ];
    },
    
    // حفظ المجتمع
    saveCommunity: function(community) {
        try {
            const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
            
            if (!systemData.communities) {
                systemData.communities = [];
            }
            
            // التحقق إذا كان المجتمع موجودًا
            const existingIndex = systemData.communities.findIndex(c => c.name === community.name);
            
            if (existingIndex === -1) {
                systemData.communities.push(community);
            } else {
                systemData.communities[existingIndex] = community;
            }
            
            localStorage.setItem('egybook_system', JSON.stringify(systemData));
            
            return true;
        } catch (error) {
            console.error('خطأ في حفظ المجتمع:', error);
            return false;
        }
    },
    
    // جلب مجتمع
    getCommunity: function(governorate) {
        const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
        const communities = systemData.communities || [];
        
        return communities.find(c => c.name === governorate);
    },
    
    // جلب جميع المجتمعات
    getAllCommunities: function() {
        const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
        return systemData.communities || [];
    },
    
    // انضمام مستخدم لمجتمع
    joinCommunity: function(userId, governorate) {
        try {
            const community = this.getCommunity(governorate);
            if (!community) {
                console.error('المجتمع غير موجود:', governorate);
                return false;
            }
            
            // التحقق إذا كان المستخدم مسجل بالفعل
            if (!community.members.includes(userId)) {
                community.members.push(userId);
                this.saveCommunity(community);
                
                console.log(`✅ انضم المستخدم ${userId} لمجتمع ${governorate}`);
                
                // تسجيل الحدث
                this.logCommunityEvent(governorate, 'join', userId);
                
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('خطأ في انضمام المستخدم:', error);
            return false;
        }
    },
    
    // إضافة منشور للمجتمع
    addPostToCommunity: function(postId, governorate) {
        try {
            const community = this.getCommunity(governorate);
            if (!community) return false;
            
            if (!community.posts.includes(postId)) {
                community.posts.push(postId);
                this.saveCommunity(community);
                
                console.log(`📝 تم إضافة منشور ${postId} لمجتمع ${governorate}`);
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('خطأ في إضافة المنشور:', error);
            return false;
        }
    },
    
    // جلب إحصائيات المجتمع
    getCommunityStats: function(governorate) {
        const community = this.getCommunity(governorate);
        if (!community) return null;
        
        const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
        const users = systemData.users || [];
        const posts = systemData.posts || [];
        
        const communityUsers = users.filter(u => u.governorate === governorate);
        const communityPosts = posts.filter(p => p.governorate === governorate);
        const today = new Date().toDateString();
        
        return {
            name: governorate,
            totalMembers: community.members.length,
            activeMembers: communityUsers.filter(u => u.status === 'active').length,
            totalPosts: community.posts.length,
            todayPosts: communityPosts.filter(p => 
                new Date(p.createdAt).toDateString() === today
            ).length,
            eventsCount: community.events.length,
            adsCount: community.ads.length,
            engagementRate: this.calculateEngagementRate(community)
        };
    },
    
    // حساب نسبة التفاعل
    calculateEngagementRate: function(community) {
        const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
        const posts = systemData.posts || [];
        
        const communityPosts = posts.filter(p => community.posts.includes(p.id));
        if (communityPosts.length === 0) return 0;
        
        const totalLikes = communityPosts.reduce((sum, post) => 
            sum + (post.likes ? post.likes.length : 0), 0);
        const totalComments = communityPosts.reduce((sum, post) => 
            sum + (post.comments ? post.comments.length : 0), 0);
        
        const totalEngagement = totalLikes + totalComments;
        const engagementRate = Math.round(totalEngagement / communityPosts.length * 100) / 100;
        
        return engagementRate;
    },
    
    // تسجيل حدث في المجتمع
    logCommunityEvent: function(governorate, eventType, userId, details = {}) {
        try {
            const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
            
            if (!systemData.communityEvents) {
                systemData.communityEvents = [];
            }
            
            const event = {
                id: Date.now(),
                governorate: governorate,
                type: eventType, // join, post, comment, like, etc.
                userId: userId,
                details: details,
                timestamp: new Date().toISOString()
            };
            
            systemData.communityEvents.push(event);
            localStorage.setItem('egybook_system', JSON.stringify(systemData));
            
            return true;
            
        } catch (error) {
            console.error('خطأ في تسجيل الحدث:', error);
            return false;
        }
    },
    
    // جلب أحداث المجتمع
    getCommunityEvents: function(governorate, limit = 50) {
        const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
        const events = systemData.communityEvents || [];
        
        return events
            .filter(e => e.governorate === governorate)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    },
    
    // إنشاء فعالية في المجتمع