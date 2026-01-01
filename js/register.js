// ملف التسجيل الجديد لـ EgyBook
// خاص بنظام التسجيل بالرقم القومي

console.log('📝 تحميل نظام التسجيل الجديد...');

// متغيرات عامة
let currentStep = 1;
const totalSteps = 4;
let userData = {};

// دالة التهيئة
document.addEventListener('DOMContentLoaded', function() {
    console.log('صفحة التسجيل محملة');
    
    // تهيئة خطوات النموذج
    initMultiStepForm();
    
    // إعداد أحداث الرقم القومي
    setupNationalIdEvents();
    
    // إعداد رفع الصور
    setupImageUpload();
    
    // إعداد كلمة المرور
    setupPasswordStrength();
    
    // تعيين التاريخ الافتراضي (18 سنة من الآن)
    setDefaultBirthDate();
});

// تهيئة النموذج متعدد الخطوات
function initMultiStepForm() {
    // إظهار الخطوة الأولى
    showStep(1);
    
    // أحداث أزرار التالي
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', function() {
            const nextStep = parseInt(this.dataset.next);
            
            // التحقق من صحة الخطوة الحالية قبل المتابعة
            if (validateStep(currentStep)) {
                saveStepData(currentStep);
                showStep(nextStep);
                updateProgressBar(nextStep);
            }
        });
    });
    
    // أحداث أزرار السابق
    document.querySelectorAll('.prev-step').forEach(button => {
        button.addEventListener('click', function() {
            const prevStep = parseInt(this.dataset.prev);
            showStep(prevStep);
            updateProgressBar(prevStep);
        });
    });
    
    // حدث إرسال النموذج النهائي
    document.querySelector('.submit-final').addEventListener('click', function(e) {
        e.preventDefault();
        submitRegistration();
    });
}

// إظهار خطوة معينة
function showStep(step) {
    // إخفاء جميع الخطوات
    document.querySelectorAll('.form-step').forEach(el => {
        el.classList.remove('active');
    });
    
    // إظهار الخطوة المطلوبة
    document.querySelector(`.form-step[data-step="${step}"]`).classList.add('active');
    currentStep = step;
    
    // تحديث ملخص المراجعة في الخطوة 4
    if (step === 4) {
        updateReviewSummary();
    }
    
    console.log(`الانتقال للخطوة ${step}`);
}

// تحديث شريط التقدم
function updateProgressBar(step) {
    document.querySelectorAll('.progress-step').forEach(el => {
        el.classList.remove('active');
    });
    
    for (let i = 1; i <= step; i++) {
        document.querySelector(`.progress-step[data-step="${i}"]`).classList.add('active');
    }
}

// التحقق من صحة خطوة
function validateStep(step) {
    let isValid = true;
    let errorMessage = '';
    
    switch(step) {
        case 1: // البيانات الشخصية
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const birthDate = document.getElementById('birthDate').value;
            const governorate = document.getElementById('governorate').value;
            
            if (!firstName || firstName.length < 2) {
                errorMessage = 'الاسم الأول يجب أن يكون حرفين على الأقل';
                isValid = false;
            } else if (!lastName || lastName.length < 2) {
                errorMessage = 'اسم العائلة يجب أن يكون حرفين على الأقل';
                isValid = false;
            } else if (!birthDate) {
                errorMessage = 'تاريخ الميلاد مطلوب';
                isValid = false;
            } else if (!isAdult(birthDate)) {
                errorMessage = 'يجب أن تكون 18 سنة أو أكثر';
                isValid = false;
            } else if (!governorate) {
                errorMessage = 'يرجى اختيار المحافظة';
                isValid = false;
            }
            break;
            
        case 2: // معلومات الاتصال
            const email = document.getElementById('email').value.trim();
            const confirmEmail = document.getElementById('confirmEmail').value.trim();
            const phone = document.getElementById('phone').value.trim();
            
            if (!EgyBook.validateData(email, 'email')) {
                errorMessage = 'البريد الإلكتروني غير صحيح';
                isValid = false;
            } else if (email !== confirmEmail) {
                errorMessage = 'البريد الإلكتروني غير متطابق';
                isValid = false;
            } else if (!EgyBook.validateData(phone, 'phone')) {
                errorMessage = 'رقم الهاتف غير صحيح';
                isValid = false;
            } else if (isEmailRegistered(email)) {
                errorMessage = 'هذا البريد مسجل مسبقاً';
                isValid = false;
            }
            break;
            
        case 3: // الهوية الوطنية
            const nationalId = document.getElementById('nationalId').value.trim();
            const idImage = document.getElementById('idImage').files[0];
            const terms = document.getElementById('terms').checked;
            
            if (!EgyBook.validateData(nationalId, 'national_id')) {
                errorMessage = 'الرقم القومي يجب أن يكون 14 رقمًا';
                isValid = false;
            } else if (isNationalIdRegistered(nationalId)) {
                errorMessage = 'الرقم القومي مسجل مسبقاً';
                isValid = false;
            } else if (!idImage) {
                errorMessage = 'صورة الهوية مطلوبة';
                isValid = false;
            } else if (!isValidImage(idImage)) {
                errorMessage = 'نوع الصورة غير مدعوم';
                isValid = false;
            } else if (!terms) {
                errorMessage = 'يجب الموافقة على الشروط والأحكام';
                isValid = false;
            }
            break;
    }
    
    if (!isValid && errorMessage) {
        EgyBook.showMessage(errorMessage, 'error');
    }
    
    return isValid;
}

// حفظ بيانات الخطوة
function saveStepData(step) {
    switch(step) {
        case 1:
            userData.firstName = document.getElementById('firstName').value.trim();
            userData.lastName = document.getElementById('lastName').value.trim();
            userData.birthDate = document.getElementById('birthDate').value;
            userData.governorate = document.getElementById('governorate').value;
            break;
            
        case 2:
            userData.email = document.getElementById('email').value.trim();
            userData.phone = document.getElementById('phone').value.trim();
            break;
            
        case 3:
            userData.nationalId = document.getElementById('nationalId').value.trim();
            userData.idImage = document.getElementById('idImage').files[0];
            break;
            
case 4: // المراجعة النهائية
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!password) {
        errorMessage = 'كلمة المرور مطلوبة';
        isValid = false;
    } else if (password.length < 6) { // عدلنا من 8 لـ 6
        errorMessage = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
        isValid = false;
    } else if (password !== confirmPassword) {
        errorMessage = 'كلمة المرور غير متطابقة';
        isValid = false;
    }
    break;
    }
    
    console.log(`حفظ بيانات الخطوة ${step}:`, userData);
}

// إعداد أحداث الرقم القومي
function setupNationalIdEvents() {
    const nationalIdInput = document.getElementById('nationalId');
    
    nationalIdInput.addEventListener('input', function(e) {
        // السماح بالأرقام فقط
        this.value = this.value.replace(/\D/g, '');
        
        // إذا كان الرقم 14 رقمًا، تحليل المعلومات
        if (this.value.length === 14) {
            parseNationalId(this.value);
        }
    });
}

// تحليل الرقم القومي
function parseNationalId(id) {
    if (id.length !== 14) return;
    
    try {
        // السنة: أول رقمين (القرن)
        const centuryCode = id[0];
        const yearDigits = id.substring(1, 3);
        let birthYear;
        
        if (centuryCode === '2') {
            birthYear = 1900 + parseInt(yearDigits);
        } else if (centuryCode === '3') {
            birthYear = 2000 + parseInt(yearDigits);
        }
        
        // الشهر: الرقمان 4-5
        const birthMonth = parseInt(id.substring(3, 5));
        
        // اليوم: الرقمان 6-7
        const birthDay = parseInt(id.substring(5, 7));
        
        // المحافظة: الرقمان 8-9
        const govCode = parseInt(id.substring(7, 9));
        
        // النوع: الرقم 13 (زوجي = أنثى، فردي = ذكر)
        const genderDigit = parseInt(id[12]);
        const gender = genderDigit % 2 === 0 ? 'أنثى' : 'ذكر';
        
        // تحديث واجهة المستخدم
        document.getElementById('idBirthYear').textContent = `سنة الميلاد: ${birthYear}`;
        document.getElementById('idGender').textContent = `النوع: ${gender}`;
        
        // تحويل كود المحافظة لاسم
        const governorateName = getGovernorateName(govCode);
        document.getElementById('idGovernorate').textContent = `المحافظة: ${governorateName}`;
        
        // حفظ في بيانات المستخدم
        userData.parsedId = {
            birthYear,
            birthMonth,
            birthDay,
            governorateCode: govCode,
            governorateName,
            gender
        };
        
    } catch (error) {
        console.error('خطأ في تحليل الرقم القومي:', error);
    }
}

// الحصول على اسم المحافظة من الكود
function getGovernorateName(code) {
    const governorates = {
        1: 'القاهرة',
        2: 'الإسكندرية',
        3: 'بورسعيد',
        4: 'السويس',
        11: 'دمياط',
        12: 'الدقهلية',
        13: 'الشرقية',
        14: 'القليوبية',
        15: 'كفر الشيخ',
        16: 'الغربية',
        17: 'المنوفية',
        18: 'البحيرة',
        19: 'الإسماعيلية',
        21: 'الجيزة',
        22: 'بني سويف',
        23: 'الفيوم',
        24: 'المنيا',
        25: 'أسيوط',
        26: 'سوهاج',
        27: 'قنا',
        28: 'الأقصر',
        29: 'أسوان',
        31: 'البحر الأحمر',
        32: 'الوادي الجديد',
        33: 'مطروح',
        34: 'شمال سيناء',
        35: 'جنوب سيناء'
    };
    
    return governorates[code] || 'غير معروفة';
}

// إعداد رفع الصور
function setupImageUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('idImage');
    const preview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const removeBtn = document.getElementById('removeImage');
    
    // النقر على منطقة الرفع
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // سحب وإفلات
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ce1126';
        uploadArea.style.background = '#e9ecef';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#1e3a8a';
        uploadArea.style.background = '#f8f9fa';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#1e3a8a';
        uploadArea.style.background = '#f8f9fa';
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleImageSelection(e.dataTransfer.files[0]);
        }
    });
    
    // تغيير الملف
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleImageSelection(e.target.files[0]);
        }
    });
    
    // إزالة الصورة
    removeBtn.addEventListener('click', () => {
        fileInput.value = '';
        preview.style.display = 'none';
        uploadArea.style.display = 'block';
    });
}

// معالجة اختيار الصورة
function handleImageSelection(file) {
    if (!isValidImage(file)) {
        EgyBook.showMessage('نوع الملف غير مدعوم. يرجى اختيار صورة.', 'error');
        return;
    }
    
    // عرض المعاينة
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('previewImage').src = e.target.result;
        document.getElementById('imagePreview').style.display = 'block';
        document.getElementById('uploadArea').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// التحقق من صورة الهوية
function isValidImage(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return validTypes.includes(file.type) && file.size <= maxSize;
}

// إعداد قوة كلمة المرور
function setupPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        
        // تحديث شريط القوة
        strengthBar.style.width = strength.percentage + '%';
        strengthBar.style.backgroundColor = strength.color;
        
        // تحديث النص
        strengthText.textContent = `قوة كلمة المرور: ${strength.text}`;
        strengthText.style.color = strength.color;
    });
}

// حساب قوة كلمة المرور
function calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strengthLevels = [
        { text: 'ضعيفة', color: '#ce1126', percentage: 20 },
        { text: 'متوسطة', color: '#f39c12', percentage: 40 },
        { text: 'جيدة', color: '#f1c40f', percentage: 60 },
        { text: 'قوية', color: '#2ecc71', percentage: 80 },
        { text: 'قوية جداً', color: '#27ae60', percentage: 100 }
    ];
    
    return strengthLevels[Math.min(score, strengthLevels.length - 1)];
}

// تحديث ملخص المراجعة
function updateReviewSummary() {
    document.getElementById('reviewName').textContent = 
        `${userData.firstName} ${userData.lastName}`;
    document.getElementById('reviewGov').textContent = userData.governorate;
    document.getElementById('reviewEmail').textContent = userData.email;
    document.getElementById('reviewPhone').textContent = userData.phone;
    document.getElementById('reviewId').textContent = 
        userData.nationalId ? `${userData.nationalId.substring(0, 7)}*******` : '-';
}

// التحقق من البريد المسجل
function isEmailRegistered(email) {
    const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
    const users = systemData.users || [];
    
    return users.some(user => user.email === email);
}

// التحقق من الرقم القومي المسجل
function isNationalIdRegistered(nationalId) {
    const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
    const users = systemData.users || [];
    
    return users.some(user => user.nationalId === nationalId);
}

// التحقق من السن
function isAdult(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        return age - 1 >= 18;
    }
    
    return age >= 18;
}

// تعيين تاريخ الميلاد الافتراضي
function setDefaultBirthDate() {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    
    document.getElementById('birthDate').max = minDate.toISOString().split('T')[0];
    document.getElementById('birthDate').min = maxDate.toISOString().split('T')[0];
}

// إرسال التسجيل
function submitRegistration() {
    // التحقق النهائي
    if (!validateStep(4)) {
        EgyBook.showMessage('يرجى تصحيح الأخطاء قبل الإرسال', 'error');
        return;
    }
    
    // التحقق من تطابق كلمة المرور
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        EgyBook.showMessage('كلمة المرور غير متطابقة', 'error');
        return;
    }
    
    // جمع كل البيانات
    saveStepData(4);
    
    // إنشاء كائن المستخدم النهائي
    const newUser = {
        id: Date.now(),
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        phone: userData.phone,
        nationalId: userData.nationalId,
        governorate: userData.governorate,
        birthDate: userData.birthDate,
        password: password,
        createdAt: new Date().toISOString(),
        status: 'pending', // في انتظار التحقق
        role: 'user',
        community: userData.governorate,
        balance: 0,
        freeAds: 3,
        profileImage: null
    };
    
    // حفظ المستخدم في النظام
    saveUser(newUser);
    
    // عرض رسالة النجاح
    EgyBook.showMessage('✅ تم إنشاء الحساب بنجاح! جاري التوجيه...', 'success');
    
    // تسجيل الدخول تلقائياً
    setTimeout(() => {
        localStorage.setItem('current_user', JSON.stringify(newUser));
        window.location.href = '../user/feed.html';
    }, 2000);
}

// حفظ المستخدم في النظام
function saveUser(user) {
    const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
    
    if (!systemData.users) {
        systemData.users = [];
    }
    
    systemData.users.push(user);
    localStorage.setItem('egybook_system', JSON.stringify(systemData));
    
    console.log('✅ تم حفظ المستخدم:', user.email);
}

// جعل الدوال متاحة
window.Registration = {
    validateStep,
    saveUser,
    parseNationalId
};

console.log('✅ نظام التسجيل جاهز للاستخدام');