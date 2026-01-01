// ملف JavaScript الرئيسي لـ EgyBook
// هذا الملف يتحكم في جميع الصفحات

console.log('𓂀 مرحبًا بك في EgyBook 𓂀');

// دالة تبدأ عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('الصفحة محملة بنجاح');
    
    // تهيئة النظام
    initializeSystem();
    
    // إضافة أحداث للأزرار
    setupButtons();
    
    // تحميل البيانات إذا وجدت
    loadInitialData();
});

// تهيئة النظام الأساسي
function initializeSystem() {
    console.log('جاري تهيئة نظام EgyBook...');
    
    // إنشاء تخزين محلي إذا لم يكن موجودًا
    if (!localStorage.getItem('egybook_initialized')) {
        console.log('جاري إنشاء التخزين الأولي...');
        
        // بيانات افتراضية
        const initialData = {
            initialized: true,
            version: '1.0.0',
            created_at: new Date().toISOString(),
            users: [],
            admins: [],
            posts: [],
            governorates: 27,
            settings: {
                app_name: 'EgyBook',
                currency: 'EGP',
                theme: 'egyptian'
            }
        };
        
        // حفظ في localStorage
        localStorage.setItem('egybook_system', JSON.stringify(initialData));
        localStorage.setItem('egybook_initialized', 'true');
        
        console.log('✅ التهيئة تمت بنجاح');
    } else {
        console.log('✅ النظام مهيأ مسبقًا');
    }
}

// إعداد أحداث الأزرار
function setupButtons() {
    console.log('جاري إعداد أحداث الأزرار...');
    
    // جميع أزرار الدخول
    const loginButtons = document.querySelectorAll('.btn');
    
    loginButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const buttonType = this.classList[1]; // user-btn, admin-btn, moderator-btn
            
            console.log(`تم النقر على زر: ${buttonType}`);
            
            // إضافة تأثير للنقر
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
            
            // رسالة تأكيد
            let message = '';
            
            switch(buttonType) {
                case 'user-btn':
                    message = 'جاري التوجه لتسجيل المستخدمين...';
                    break;
                case 'admin-btn':
                    message = 'جاري التوجه لتسجيل المشرف العام...';
                    break;
                case 'moderator-btn':
                    message = 'جاري التوجه لتسجيل مشرفي المحافظات...';
                    break;
            }
            
            if (message) {
                showMessage(message, 'info');
            }
        });
    });
    
    console.log(`✅ تم إعداد ${loginButtons.length} زر`);
}

// تحميل البيانات الأولية
function loadInitialData() {
    console.log('جاري تحميل البيانات...');
    
    // جلب إعدادات النظام
    const systemData = localStorage.getItem('egybook_system');
    
    if (systemData) {
        const data = JSON.parse(systemData);
        console.log('📊 إحصائيات النظام:', {
            version: data.version,
            users: data.users ? data.users.length : 0,
            posts: data.posts ? data.posts.length : 0,
            governorates: data.governorates
        });
    }
}

// عرض رسالة للمستخدم
function showMessage(text, type = 'info') {
    // إنصراف عنصر الرسالة
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.innerHTML = `
        <p>${text}</p>
        <button onclick="this.parentElement.remove()">✕</button>
    `;
    
    // إضافة أنماط
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'info' ? '#1e3a8a' : type === 'success' ? '#27ae60' : '#ce1126'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideDown 0.3s ease;
    `;
    
    // إضافة الرسالة للصفحة
    document.body.appendChild(messageDiv);
    
    // إزالة الرسالة بعد 5 ثوان
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}

// إضافة أنماط للرسائل
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translate(-50%, -100%);
            opacity: 0;
        }
        to {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }
    
    .message button {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-right: 10px;
    }
`;
document.head.appendChild(style);

// دالة للتحقق من صحة البيانات
function validateData(data, type) {
    switch(type) {
        case 'email':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data);
        case 'national_id':
            return /^\d{14}$/.test(data);
        case 'phone':
            return /^01[0-9]{9}$/.test(data);
        default:
            return false;
    }
}

// جعل الدوال متاحة عالمياً
window.EgyBook = {
    showMessage,
    validateData,
    initializeSystem
};

console.log('✅ تم تحميل ملف main.js بنجاح');