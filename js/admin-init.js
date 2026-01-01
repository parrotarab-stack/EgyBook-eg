// تهيئة إدارة المشرفين
console.log('🔐 تحميل نظام إدارة المشرفين...');

const AdminManager = {
    // تغيير كلمة مرور المشرف العام
    changeSuperAdminPassword: function(newPassword) {
        try {
            const systemData = JSON.parse(localStorage.getItem('egybook_system') || '{}');
            const admins = systemData.admins || [];
            
            // البحث عن المشرف العام
            const adminIndex = admins.findIndex(a => a.role === 'super_admin');
            
            if (adminIndex === -1) {
                console.error('❌ لم يتم العثور على المشرف العام');
                return false;
            }
            
            // تغيير كلمة المرور
            admins[adminIndex].password = newPassword;
            systemData.admins = admins;
            localStorage.setItem('egybook_system', JSON.stringify(systemData));
            
            // إذا كان مسجل دخول، تحديث الجلسة
            const currentAdmin = JSON.parse(localStorage.getItem('current_admin'));
            if (currentAdmin && currentAdmin.role === 'super_admin') {
                currentAdmin.password = newPassword;
                localStorage.setItem('current_admin', JSON.stringify(currentAdmin));
            }
            
            console.log('✅ تم تغيير كلمة مرور المشرف العام');
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في تغيير كلمة المرور:', error);
            return false;
        }
    },
    
    // إنشاء باسورد افتراضي قوي
    generateStrongPassword: function(length = 12) {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        
        // إضافة حرف كبير وحرف صغير ورقم ورمز إجباري
        password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
        password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
        password += "0123456789"[Math.floor(Math.random() * 10)];
        password += "!@#$%^&*"[Math.floor(Math.random() * 8)];
        
        // إضافة باقي الأحرف عشوائيًا
        for (let i = 4; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }
        
        // خلط الباسورد
        password = password.split('').sort(() => Math.random() - 0.5).join('');
        
        return password;
    },
    
    // تغيير الباسورد من الكونسول (للمطورين)
    changePasswordFromConsole: function() {
        console.log('🔐 تغيير كلمة مرور المشرف العام من الكونسول');
        console.log('============================================');
        
        const newPassword = prompt('أدخل كلمة المرور الجديدة (8 أحرف على الأقل):');
        
        if (!newPassword || newPassword.length < 8) {
            console.error('❌ كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return false;
        }
        
        const confirmPassword = prompt('أعد إدخال كلمة المرور الجديدة:');
        
        if (newPassword !== confirmPassword) {
            console.error('❌ كلمتا المرور غير متطابقتين');
            return false;
        }
        
        const success = this.changeSuperAdminPassword(newPassword);
        
        if (success) {
            console.log('✅ تم تغيير كلمة المرور بنجاح!');
            console.log('🔑 كلمة المرور الجديدة:', newPassword);
            console.log('⚠️ احفظ هذه الكلمة في مكان آمن!');
            return true;
        } else {
            console.error('❌ فشل في تغيير كلمة المرور');
            return false;
        }
    },
    
    // إنشاء باسورد قوي تلقائيًا
    autoGenerateStrongPassword: function() {
        const strongPassword = this.generateStrongPassword();
        const success = this.changeSuperAdminPassword(strongPassword);
        
        if (success) {
            console.log('✅ تم إنشاء كلمة مرور قوية تلقائيًا!');
            console.log('🔑 كلمة المرور الجديدة:', strongPassword);
            console.log('📝 احفظ هذه الكلمة الآن:', strongPassword);
            console.log('⚠️ هذه هي المرة الوحيدة التي تظهر فيها!');
            return strongPassword;
        }
        
        return null;
    }
};

// جعل المدير متاحًا في الكونسول
window.AdminManager = AdminManager;

console.log('✅ نظام إدارة المشرفين جاهز للاستخدام');
console.log('📝 الأوامر المتاحة:');
console.log('  AdminManager.changePasswordFromConsole() - لتغيير الباسورد من الكونسول');
console.log('  AdminManager.autoGenerateStrongPassword() - لإنشاء باسورد قوي تلقائيًا');