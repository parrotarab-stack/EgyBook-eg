/**
 * إعدادات النظام الأساسية
 */

const EgyBookConfig = {
    // إعدادات التطبيق
    APP_NAME: 'EgyBook',
    VERSION: '1.0.0',
    AUTHOR: 'EgyBook Team',
    
    // إعدادات المحافظات
    GOVERNORATES: [
        'القاهرة', 'الإسكندرية', 'بورسعيد', 'السويس', 'دمياط', 'الدقهلية',
        'الشرقية', 'القليوبية', 'كفر الشيخ', 'الغربية', 'المنوفية',
        'البحيرة', 'الإسماعيلية', 'الجيزة', 'بني سويف', 'الفيوم',
        'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان',
        'البحر الأحمر', 'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء'
    ],
    
    // إعدادات الألوان
    COLORS: {
        PRIMARY: '#ce1126', // أحمر علم مصر
        SECONDARY: '#1e3a8a', // أزرق فرعوني
        ACCENT: '#d4af37', // ذهبي فرعوني
        BACKGROUND: '#f0f0f0',
        TEXT: '#2d2424'
    },
    
    // إعدادات المسارات
    PATHS: {
        PAGES: './pages/',
        ASSETS: './assets/',
        CSS: './css/',
        JS: './js/',
        API: './api/'
    },
    
    // إعدادات التخزين
    STORAGE_KEYS: {
        USERS: 'egybook_users',
        ADMINS: 'egybook_admins',
        POSTS: 'egybook_posts',
        CURRENT_USER: 'currentUser',
        CURRENT_ADMIN: 'currentAdmin',
        SYSTEM_CONFIG: 'systemConfig'
    },
    
    // إعدادات التحقق
    VALIDATION: {
        MIN_PASSWORD_LENGTH: 6,
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif']
    },
    
    // إعدادات الإعلانات
    ADS: {
        PRICE_PER_GOVERNORATE: 50,
        MIN_AD_DURATION: 1, // يوم
        MAX_AD_DURATION: 30, // يوم
        FREE_ADS_PER_USER: 3
    }
};

// جعل الإعدادات متاحة عالميًا
window.Config = EgyBookConfig;

console.log(`%c${EgyBookConfig.APP_NAME} v${EgyBookConfig.VERSION}`, 
    'color: #ce1126; font-size: 20px; font-weight: bold;');
console.log('تم تحميل إعدادات النظام بنجاح');