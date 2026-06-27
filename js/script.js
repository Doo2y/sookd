document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links a');

    // ฟังก์ชันเช็คว่าตอนนี้เลื่อนจออยู่ส่วนไหน
    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // ถ้าเลื่อนมาถึงส่วนนั้นๆ แล้ว
            if (scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        // ลบ/เพิ่ม คลาส active ให้เมนูด้านบนไฮไลท์สี
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
});