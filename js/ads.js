// نظام الإعلانات الممولة لـ EgyBook
console.log('💰 تحميل نظام الإعلانات الممولة...');

const AdsSystem = {
    // إنشاء إعلان ممول
    createSponsoredAd: function(adData) {
        try {
            const currentUser = UserSystem.getCurrentUser();
            if (!currentUser) {
                EgyBook.showMessage('يجب تسجيل الدخول أولاً', 'error');
                return null;
            }
            
            // حساب تكلفة الإعلان
            const cost = this.calculateAdCost(adData);
            
            // التحقق من رصيد المستخدم
            if (currentUser.balance < cost) {
                EgyBook.showMessage(`رصيدك غير كافي. التكلفة: ${cost} EGP`, 'error');
                return null;
            }
            
            const ad = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                userId: currentUser.id,
                userName: currentUser.name,
                userGovernorate: currentUser.governorate,
                title: adData.title,
                description: adData.description,
                image: adData.image,
                targetGovernorates: adData.targetGovernorates || ['all'],
                type: adData.type || 'product', // product, service, job, event
                budget: cost,
                duration: adData.duration || 7, // أيام
                status: 'pending', // pending, active, completed, rejected
                impressions: 0,
                clicks: 0,
                createdAt: new Date().toISOString(),
                startsAt: adData.startsAt || new Date().toISOString(),
                endsAt: this.calculateEndDate(adData.duration || 7)
            };
            
            // حفظ الإعلان
            this.saveAd(ad);
            
            // خصم المبلغ من رصيد المستخدم
            UserSystem.updateUser({
                balance: currentUser.balance - cost,
                adsCount: (currentUser.adsCount || 0) + 1
            });
            
            console.log('✅ تم إنشاء إعلان ممول:', ad.id);
            EgyBook.showMessage(`تم إنشاء إعلانك بنجاح! التكلفة: ${cost} EGP`, 'success');
            
            return ad;
            
        } catch (error) {
            console.error('خطأ في إنشاء الإعلان:', error);
            EgyBook.showMessage('حدث خطأ في إنشاء الإعلان', 'error');
            return null;
        }
    },
    
    // حساب تكلفة الإعلان
    calculateAdCost: function(adData) {
        let baseCost = 50; // تكلفة أساسية لكل محافظة
        
        // حساب عدد المحافظات المستهدفة
        const governorateCount = adData.targetGovernorates.includes('all') ? 
            27 : adData.targetGovernorates.length;
        
        // حساب التكلفة حسب المدة
        const durationMultiplier = this.getDurationMultiplier(adData.duration || 7);
        
        // حساب التكلفة النهائية
        const totalCost = baseCost * governorateCount * durationMultiplier;
        
        // تطبيق الخصومات إذا وجدت
        const discount = this.calculateDiscount(adData);
        
        return Math.max(10, totalCost - discount); // حد أدنى 10 جنيه
    },
    
    // مضاعف المدة
    getDurationMultiplier: function(days) {
        if (days <= 3) return 0.7;
        if (days <= 7) return 1;
        if (days <= 14) return 1.8;
        if (days <= 30) return 3.5;
        return 6; // أكثر من 30 يوم
    },
    
    // حساب الخصم
    calculateDiscount: function(adData) {
        const currentUser = UserSystem.getCurrentUser();
        if (!currentUser) return 0;
        
        let discount = 0;
        
        // خصم للعملاء الدائمين
        const userAdsCount = currentUser.adsCount || 0;
        if (userAdsCount >= 10) {
            discount += 20; // 20 جنيه خصم
        } else if (userAdsCount >= 5) {
            discount += 10; // 10 جنيه خصم
        }
        
        // خصم العروض الموسمية
        const today = new Date();
        const month = today.getMonth();
        
        // خصومات في أشهر معينة
        if (month === 0) discount += 15; // يناير
        if (month === 11) discount += 20; // ديسمبر (الكريسماس)
        
        return discount;
    },
    
    // حساب تاريخ الانتهاء
    calculateEndDate: function(durationDays) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + durationDays);
        return endDate.toISOString();
    },
    
    // حفظ الإعلان
    saveAd: function(ad) {
        try {
            const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
            
            if (!systemData.ads) {
                systemData.ads = [];
            }
            
            systemData.ads.push(ad);
            localStorage.setItem('egybook_system', JSON.stringify(systemData));
            
            // إضافة الإعلان كمنشور ممول
            this.createAdPost(ad);
            
            return true;
        } catch (error) {
            console.error('خطأ في حفظ الإعلان:', error);
            return false;
        }
    },
    
    // إنشاء منشور للإعلان
    createAdPost: function(ad) {
        const postContent = `📢 **إعلان ممول**\n\n**${ad.title}**\n\n${ad.description}\n\n📍 يشمل: ${ad.targetGovernorates.includes('all') ? 'جميع المحافظات' : ad.targetGovernorates.join('، ')}`;
        
        const post = PostSystem.createPost(postContent, {
            type: 'ad',
            isSponsored: true,
            sponsoredRegions: ad.targetGovernorates,
            images: ad.image ? [ad.image] : []
        });
        
        return post;
    },
    
    // جلب الإعلانات النشطة
    getActiveAds: function() {
        const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
        const ads = systemData.ads || [];
        const now = new Date().toISOString();
        
        return ads.filter(ad => 
            ad.status === 'active' && 
            new Date(ad.startsAt) <= new Date(now) && 
            new Date(ad.endsAt) >= new Date(now)
        );
    },
    
    // جلب إعلانات المستخدم
    getUserAds: function(userId) {
        const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
        const ads = systemData.ads || [];
        
        return ads.filter(ad => ad.userId === userId);
    },
    
    // تفعيل الإعلان (بواسطة المشرف)
    activateAd: function(adId) {
        try {
            const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
            const ads = systemData.ads || [];
            const adIndex = ads.findIndex(ad => ad.id === adId);
            
            if (adIndex === -1) return false;
            
            ads[adIndex].status = 'active';
            ads[adIndex].activatedAt = new Date().toISOString();
            
            systemData.ads = ads;
            localStorage.setItem('egybook_system', JSON.stringify(systemData));
            
            console.log(`✅ تم تفعيل الإعلان: ${adId}`);
            return true;
            
        } catch (error) {
            console.error('خطأ في تفعيل الإعلان:', error);
            return false;
        }
    },
    
    // رفض الإعلان (بواسطة المشرف)
    rejectAd: function(adId, reason) {
        try {
            const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
            const ads = systemData.ads || [];
            const adIndex = ads.findIndex(ad => ad.id === adId);
            
            if (adIndex === -1) return false;
            
            ads[adIndex].status = 'rejected';
            ads[adIndex].rejectionReason = reason;
            
            // استرداد المبلغ للمستخدم
            const ad = ads[adIndex];
            const user = UserSystem.getUserById(ad.userId);
            if (user) {
                user.balance = (user.balance || 0) + ad.budget;
                UserSystem.updateUserInSystem(user);
            }
            
            systemData.ads = ads;
            localStorage.setItem('egybook_system', JSON.stringify(systemData));
            
            console.log(`❌ تم رفض الإعلان: ${adId}`);
            return true;
            
        } catch (error) {
            console.error('خطأ في رفض الإعلان:', error);
            return false;
        }
    },
    
    // زيادة عدد المشاهدات
    incrementImpressions: function(adId) {
        try {
            const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
            const ads = systemData.ads || [];
            const adIndex = ads.findIndex(ad => ad.id === adId);
            
            if (adIndex === -1) return false;
            
            ads[adIndex].impressions = (ads[adIndex].impressions || 0) + 1;
            
            systemData.ads = ads;
            localStorage.setItem('egybook_system', JSON.stringify(systemData));
            
            return true;
            
        } catch (error) {
            console.error('خطأ في زيادة المشاهدات:', error);
            return false;
        }
    },
    
    // زيادة عدد النقرات
    incrementClicks: function(adId) {
        try {
            const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
            const ads = systemData.ads || [];
            const adIndex = ads.findIndex(ad => ad.id === adId);
            
            if (adIndex === -1) return false;
            
            ads[adIndex].clicks = (ads[adIndex].clicks || 0) + 1;
            
            systemData.ads = ads;
            localStorage.setItem('egybook_system', JSON.stringify(systemData));
            
            return true;
            
        } catch (error) {
            console.error('خطأ في زيادة النقرات:', error);
            return false;
        }
    },
    
    // جلب إحصائيات الإعلانات
    getAdsStats: function() {
        const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
        const ads = systemData.ads || [];
        const now = new Date();
        
        const stats = {
            total: ads.length,
            active: ads.filter(ad => ad.status === 'active').length,
            pending: ads.filter(ad => ad.status === 'pending').length,
            completed: ads.filter(ad => ad.status === 'completed').length,
            rejected: ads.filter(ad => ad.status === 'rejected').length,
            
            totalRevenue: ads.reduce((sum, ad) => sum + (ad.budget || 0), 0),
            todayRevenue: ads
                .filter(ad => {
                    const adDate = new Date(ad.createdAt);
                    return adDate.toDateString() === now.toDateString();
                })
                .reduce((sum, ad) => sum + (ad.budget || 0), 0),
            
            totalImpressions: ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0),
            totalClicks: ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0),
            
            byType: {
                product: ads.filter(ad => ad.type === 'product').length,
                service: ads.filter(ad => ad.type === 'service').length,
                job: ads.filter(ad => ad.type === 'job').length,
                event: ads.filter(ad => ad.type === 'event').length
            }
        };
        
        return stats;
    },
    
    // جلب الإعلانات حسب المحافظة
    getAdsByGovernorate: function(governorate) {
        const activeAds = this.getActiveAds();
        
        return activeAds.filter(ad => 
            ad.targetGovernorates.includes('all') || 
            ad.targetGovernorates.includes(governorate)
        );
    },
    
    // عرض الإعلانات في التغذية
    displayAdsInFeed: function(governorate) {
        const ads = this.getAdsByGovernorate(governorate);
        const feedContainer = document.getElementById('feedPosts');
        
        if (!feedContainer || ads.length === 0) return;
        
        // إضافة إعلان كل 3 منشورات
        const postElements = feedContainer.querySelectorAll('.post-card');
        
        postElements.forEach((post, index) => {
            if ((index + 1) % 3 === 0 && ads.length > 0) {
                const randomAd = ads[Math.floor(Math.random() * ads.length)];
                const adElement = this.createAdElement(randomAd);
                
                // إضافة الإعلان بعد المنشور
                post.insertAdjacentHTML('afterend', adElement);
                
                // زيادة عدد المشاهدات
                this.incrementImpressions(randomAd.id);
                
                // إضافة حدث النقر
                setTimeout(() => {
                    const adCard = document.querySelector(`[data-ad-id="${randomAd.id}"]`);
                    if (adCard) {
                        adCard.addEventListener('click', () => {
                            this.incrementClicks(randomAd.id);
                            this.showAdDetails(randomAd.id);
                        });
                    }
                }, 100);
            }
        });
    },
    
    // إنشاء عنصر الإعلان
    createAdElement: function(ad) {
        return `
            <div class="ad-card" data-ad-id="${ad.id}">
                <div class="ad-badge">🤑 إعلان ممول</div>
                <div class="ad-content">
                    <h4>${ad.title}</h4>
                    <p>${ad.description.substring(0, 100)}...</p>
                    <div class="ad-stats">
                        <span>👁️ ${ad.impressions || 0} مشاهدة</span>
                        <span>👆 ${ad.clicks || 0} نقر</span>
                    </div>
                    <button class="ad-button" onclick="AdsSystem.showAdDetails('${ad.id}')">
                        عرض التفاصيل
                    </button>
                </div>
            </div>
        `;
    },
    
    // عرض تفاصيل الإعلان
    showAdDetails: function(adId) {
        const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
        const ads = systemData.ads || [];
        const ad = ads.find(a => a.id === adId);
        
        if (!ad) return;
        
        const modal = document.createElement('div');
        modal.className = 'ad-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📢 ${ad.title}</h3>
                    <button onclick="this.parentElement.parentElement.remove()">✕</button>
                </div>
                <div class="modal-body">
                    <p>${ad.description}</p>
                    <div class="ad-details">
                        <div class="detail">
                            <span>👤 المعلن:</span>
                            <span>${ad.userName}</span>
                        </div>
                        <div class="detail">
                            <span>📍 المحافظة:</span>
                            <span>${ad.userGovernorate}</span>
                        </div>
                        <div class="detail">
                            <span>🎯 المستهدف:</span>
                            <span>${ad.targetGovernorates.includes('all') ? 'جميع المحافظات' : ad.targetGovernorates.join('، ')}</span>
                        </div>
                        <div class="detail">
                            <span>💰 الميزانية:</span>
                            <span>${ad.budget} EGP</span>
                        </div>
                        <div class="detail">
                            <span>⏰ المدة:</span>
                            <span>${ad.duration} يوم</span>
                        </div>
                        <div class="detail">
                            <span>📊 المشاهدات:</span>
                            <span>${ad.impressions || 0}</span>
                        </div>
                        <div class="detail">
                            <span>👆 النقرات:</span>
                            <span>${ad.clicks || 0}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="AdsSystem.contactAdvertiser('${ad.userId}')">
                        📞 تواصل مع المعلن
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // زيادة عدد النقرات
        this.incrementClicks(adId);
    },
    
    // التواصل مع المعلن
    contactAdvertiser: function(userId) {
        const user = UserSystem.getUserById(userId);
        if (user) {
            EgyBook.showMessage(`جاري فتح محادثة مع ${user.name}...`, 'info');
            // هنا سيتم فتح نظام المراسلة
        }
    },
    
    // التهيئة
    init: function() {
        console.log('تهيئة نظام الإعلانات...');
        
        // إضافة أنماط الإعلانات
        this.addAdStyles();
    },
    
    // إضافة أنماط الإعلانات
    addAdStyles: function() {
        const style = document.createElement('style');
        style.textContent = `
            .ad-card {
                background: linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%);
                border: 3px solid #d4af37;
                border-radius: 15px;
                padding: 20px;
                margin: 20px 0;
                position: relative;
                box-shadow: 0 5px 15px rgba(212,175,55,0.2);
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .ad-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(212,175,55,0.3);
            }
            
            .ad-badge {
                position: absolute;
                top: -10px;
                left: 20px;
                background: #d4af37;
                color: #2d2424;
                padding: 5px 15px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 0.9rem;
            }
            
            .ad-content h4 {
                color: #1e3a8a;
                margin-bottom: 10px;
            }
            
            .ad-content p {
                color: #666;
                margin-bottom: 15px;
            }
            
            .ad-stats {
                display: flex;
                gap: 20px;
                margin-bottom: 15px;
                color: #666;
                font-size: 0.9rem;
            }
            
            .ad-button {
                background: linear-gradient(135deg, #1e3a8a 0%, #0d2b5a 100%);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .ad-button:hover {
                background: linear-gradient(135deg, #0d2b5a 0%, #1e3a8a 100%);
                transform: translateY(-2px);
            }
            
            .ad-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
            }
            
            .modal-content {
                background: white;
                border-radius: 20px;
                width: 90%;
                max-width: 500px;
                z-index: 10001;
                position: relative;
                box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            }
            
            .modal-header {
                background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
                padding: 20px;
                border-radius: 20px 20px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                margin: 0;
                color: #2d2424;
            }
            
            .modal-header button {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #2d2424;
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .ad-details {
                margin-top: 20px;
            }
            
            .detail {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #eee;
            }
            
            .detail span:first-child {
                color: #666;
                font-weight: bold;
            }
            
            .detail span:last-child {
                color: #1e3a8a;
                font-weight: bold;
            }
            
            .modal-footer {
                padding: 20px;
                text-align: center;
            }
            
            .modal-footer button {
                background: linear-gradient(135deg, #27ae60 0%, #219653 100%);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 10px;
                font-weight: bold;
                cursor: pointer;
                font-size: 1.1rem;
            }
        `;
        
        document.head.appendChild(style);
    }
};

// التهيئة التلقائية
document.addEventListener('DOMContentLoaded', () => AdsSystem.init());

// جعل النظام متاحًا عالميًا
window.AdsSystem = AdsSystem;

console.log('✅ نظام الإعلانات الممولة جاهز للاستخدام');