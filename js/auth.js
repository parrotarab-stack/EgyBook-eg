// التحقق من صفحة اللوجن
function initLoginPage() {
    console.log('تهيئة صفحة تسجيل الدخول...');
    
    // إضافة حدث للنموذج
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // إضافة أحداث لأزرار الدخول البديلة
    document.querySelectorAll('.alt-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const type = this.classList.contains('phone') ? 'phone' : 'national';
            showAlternativeLogin(type);
        });
    });
}

// معالجة الدخول
function handleLogin() {
    console.log('معالجة طلب الدخول...');
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const remember = document.querySelector('input[name="remember"]').checked;
    
// التحقق من بيانات تسجيل الدخول - النسخة المعدلة
function validateLoginData(email, password) {
    // تنظيف الرسائل القديمة
    clearMessages();
    
    // التحقق من البريد الإلكتروني
    if (!email) {
        showLoginMessage('يرجى إدخال البريد الإلكتروني', 'error');
        return false;
    }
    
    if (!EgyBook.validateData(email, 'email')) {
        showLoginMessage('البريد الإلكتروني غير صحيح', 'error');
        return false;
    }
    
    // التحقق من كلمة المرور - 6 أحرف بدل 8
    if (!password) {
        showLoginMessage('يرجى إدخال كلمة المرور', 'error');
        return false;
    }
    
    if (password.length < 6) { // عدلنا من 8 لـ 6
        showLoginMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return false;
    }
    
    return true;
 }
    
    // عرض رسالة التحميل
    showLoginMessage('جاري التحقق من البيانات...', 'info');
    
    // محاكاة طلب الخادم
    setTimeout(() => {
        loginUser(email, password, remember);
    }, 1500);
}

// التحقق من بيانات الدخول
function validateLoginData(email, password) {
    // تنظيف الرسائل القديمة
    clearMessages();
    
    // التحقق من البريد الإلكتروني
    if (!email) {
        showLoginMessage('يرجى إدخال البريد الإلكتروني', 'error');
        return false;
    }
    
    if (!EgyBook.validateData(email, 'email')) {
        showLoginMessage('البريد الإلكتروني غير صحيح', 'error');
        return false;
    }
    
    // التحقق من كلمة المرور
    if (!password) {
        showLoginMessage('يرجى إدخال كلمة المرور', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showLoginMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return false;
    }
    
    return true;
}

// تسجيل دخول المستخدم
function loginUser(email, password, remember) {
    // جلب جميع المستخدمين
    const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
    const users = systemData.users || [];
    
    // البحث عن المستخدم
    const foundUser = users.find(user => 
        user.email === email && 
        user.password === password
    );
    
    if (foundUser) {
        console.log('✅ تم العثور على المستخدم:', foundUser.name);
        
        // حفظ بيانات المستخدم الحالي
        localStorage.setItem('current_user', JSON.stringify(foundUser));
        
        // إذا كان اختيار "تذكرني"
        if (remember) {
            localStorage.setItem('remember_me', 'true');
        }
        
        // عرض رسالة نجاح
        showLoginMessage('✅ تم تسجيل الدخول بنجاح! جاري التوجيه...', 'success');
        
        // توجيه إلى الصفحة الرئيسية للمستخدم
        setTimeout(() => {
            window.location.href = '../user/feed.html';
        }, 2000);
        
    } else {
        console.log('❌ بيانات الدخول غير صحيحة');
        showLoginMessage('❌ البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
    }
}

// عرض رسائل الدخول
function showLoginMessage(text, type) {
    const container = document.getElementById('message-container');
    
    // إنشاء الرسالة
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <p>${text}</p>
        <button onclick="this.parentElement.remove()">✕</button>
    `;
    
    // إضافة الرسالة
    container.appendChild(messageDiv);
    
    // إزالة الرسالة بعد 5 ثوانٍ
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}

// مسح الرسائل
function clearMessages() {
    const container = document.getElementById('message-container');
    container.innerHTML = '';
}

// عرض الدخول البديل
function showAlternativeLogin(type) {
    let message = '';
    
    if (type === 'phone') {
        message = 'جاري التوجه لتسجيل الدخول بالهاتف...';
    } else {
        message = 'جاري التوجه لتسجيل الدخول بالرقم القومي...';
    }
    
    showLoginMessage(message, 'info');
    
    // محاكاة التوجيه
    setTimeout(() => {
        if (type === 'phone') {
            window.location.href = 'verify-phone.html';
        } else {
            window.location.href = 'verify-national-id.html';
        }
    }, 1000);
}

// ملف المصادقة لـ EgyBook
// يتحكم في تسجيل الدخول والتسجيل

console.log('🔐 تحميل نظام المصادقة...');

// دالة تبدأ عند تحميل صفحة التسجيل
document.addEventListener('DOMContentLoaded', function() {
    console.log('صفحة المصادقة محملة');
    
    // التحقق إذا كان هناك نموذج تسجيل دخول
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        console.log('تم العثور على نموذج تسجيل الدخول');
        setupLoginForm();
    }
    
    // التحقق من حالة المستخدم المسجل
    checkLoggedInUser();
});

// إعداد نموذج تسجيل الدخول
function setupLoginForm() {
    const form = document.getElementById('loginForm');
    const messageContainer = document.getElementById('message-container');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // منع إرسال النموذج العادي
        
        console.log('محاولة تسجيل دخول...');
        
        // جمع البيانات من النموذج
        const formData = {
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value.trim(),
            remember: document.querySelector('input[name="remember"]').checked
        };
        
        // التحقق من صحة البيانات
        if (!validateLoginData(formData)) {
            return;
        }
        
        // محاولة تسجيل الدخول
        loginUser(formData);
    });
}

// التحقق من صحة بيانات تسجيل الدخول
function validateLoginData(data) {
    const messageContainer = document.getElementById('message-container');
    
    // تنظيف الرسائل القديمة
    messageContainer.innerHTML = '';
    
    // التحقق من البريد الإلكتروني
    if (!data.email) {
        showFormMessage('يرجى إدخال البريد الإلكتروني', 'error');
        return false;
    }
    
    if (!EgyBook.validateData(data.email, 'email')) {
        showFormMessage('البريد الإلكتروني غير صحيح', 'error');
        return false;
    }
    
    // التحقق من كلمة المرور
    if (!data.password) {
        showFormMessage('يرجى إدخال كلمة المرور', 'error');
        return false;
    }
    
    if (data.password.length < 6) {
        showFormMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return false;
    }
    
    return true;
}

// تسجيل دخول المستخدم
function loginUser(userData) {
    console.log('جاري تسجيل دخول:', userData.email);
    
    // جلب جميع المستخدمين المسجلين
    const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
    const users = systemData.users || [];
    
    // البحث عن المستخدم
    const foundUser = users.find(user => 
        user.email === userData.email && 
        user.password === userData.password
    );
    
    if (foundUser) {
        console.log('✅ تم العثور على المستخدم:', foundUser.name);
        
        // حفظ بيانات المستخدم الحالي
        localStorage.setItem('current_user', JSON.stringify(foundUser));
        
        // إذا كان اختيار "تذكرني"
        if (userData.remember) {
            localStorage.setItem('remember_me', 'true');
        }
        
        // عرض رسالة نجاح
        showFormMessage('✅ تم تسجيل الدخول بنجاح! جاري التوجيه...', 'success');
        
        // توجيه إلى الصفحة الرئيسية للمستخدم
        setTimeout(() => {
            window.location.href = '../user/feed.html';
        }, 2000);
        
    } else {
        console.log('❌ بيانات الدخول غير صحيحة');
        showFormMessage('❌ البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
    }
}

// عرض رسالة في النموذج
function showFormMessage(text, type) {
    const messageContainer = document.getElementById('message-container');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <p>${text}</p>
        <button onclick="this.parentElement.remove()">✕</button>
    `;
    
    messageContainer.appendChild(messageDiv);
    
    // إزالة الرسالة بعد 5 ثوانٍ
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}

// التحقق من وجود مستخدم مسجل
function checkLoggedInUser() {
    const currentUser = localStorage.getItem('current_user');
    
    if (currentUser) {
        const user = JSON.parse(currentUser);
        console.log('المستخدم مسجل مسبقًا:', user.name);
        
        // إذا كان في صفحة تسجيل الدخول، توجيهه مباشرة
        if (window.location.pathname.includes('login.html')) {
            setTimeout(() => {
                window.location.href = '../user/feed.html';
            }, 1000);
        }
    }
}

// تسجيل الخروج
function logoutUser() {
    localStorage.removeItem('current_user');
    console.log('تم تسجيل الخروج');
    
    // توجيه لصفحة تسجيل الدخول
    window.location.href = '../auth/login.html';
}

// جعل الدوال متاحة
window.Auth = {
    loginUser,
    logoutUser,
    showFormMessage
};

console.log('✅ نظام المصادقة جاهز للاستخدام');
document.addEventListener('DOMContentLoaded', initLoginPage);