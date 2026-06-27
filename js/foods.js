// ══════════════════════════════════════════════════
//  foods.js · Food Database (Object-Oriented Structure)
// ══════════════════════════════════════════════════

const FOODS = [
  {
    id: 1,
    name: 'กล้วยบวชชี',
    cal: 350, carb: 42, prot: 2, fat: 6,
    meal: 'snack',
    tags: ['healthy', 'balance'],
    ingredients: {
      base: ['กล้วยน้ำว้า', 'กะทิ'],
      traditional: ['น้ำตาล', 'เกลือ'],
      alternative: [
        { name: 'น้ำตาลโตนด', replaces: 'น้ำตาล' },
        { name: 'ผงแป้งกล้วย', replaces: 'แป้ง' }
      ]
    }
  },
  {
    id: 2,
    name: 'ขนมกล้วยนึ่ง',
    cal: 220, carb: 36, prot: 2, fat: 3,
    meal: 'snack',
    tags: ['healthy', 'lose'],
    ingredients: {
      base: ['มะพร้าว'],
      traditional: ['กล้วยน้ำว้า', 'น้ำตาล', 'แป้งข้าวเจ้า', 'แป้งมัน'],
      alternative: [
        { name: 'น้ำตาลโตนด', replaces: 'น้ำตาล' },
        { name: 'ผงแป้งกล้วยน้ำว้าดิบ', replaces: 'แป้ง' }
      ]
    }
  },
  {
    id: 3,
    name: 'คุกกี้แป้ง',
    cal: 350, carb: 34, prot: 5, fat: 15,
    meal: 'snack',
    tags: ['muscle', 'healthy'],
    ingredients: {
      base: ['ไข่'],
      traditional: ['น้ำตาล', 'ผงฟู/เบกกิ้งโซดา', 'เนย', 'แป้งสาลี'],
      alternative: [
        { name: 'น้ำตาลโตนด', replaces: 'น้ำตาล' },
        { name: 'น้ำมันมะพร้าว', replaces: 'เนย' },
        { name: 'ผงแป้งกล้วยน้ำว้าดิบ', replaces: 'แป้งสาลี' }
      ]
    }
  },
  {
    id: 4,
    name: 'ผัดไทย',
    cal: 550, carb: 65, prot: 29, fat: 14,
    meal: 'lunch',
    tags: ['muscle', 'balance'],
    ingredients: {
      base: ['น้ำปลา', 'มะขาม', 'เส้นจันทน์', 'ไข่'],
      traditional: ['กุยช่าย', 'กุ้ง/ไก่/หมู', 'ถั่วงอก', 'น้ำตาล'],
      alternative: [
        { name: 'น้ำตาลโตนด', replaces: 'น้ำตาล' },
        { name: 'ผงไชยา', replaces: 'เครื่องปรุง' },
        { name: 'โปรตีนพืช', replaces: 'กุ้ง/ไก่/หมู' }
      ]
    }
  },
  {
    id: 5,
    name: 'สลัดอกไก่',
    cal: 400, carb: 20, prot: 35, fat: 5,
    meal: 'dinner',
    tags: ['lose', 'healthy', 'muscle'],
    ingredients: {
      base: ['ผักสลัด', 'อกไก่'],
      traditional: ['น้ำผึ้ง', 'น้ำมัน', 'มะนาว', 'มัสตาร์ด'],
      alternative: [
        { name: 'น้ำผึ้งชันโรง', replaces: 'น้ำผึ้ง' },
        { name: 'น้ำมันมะกอก', replaces: 'น้ำมัน' },
        { name: 'ผงไชยา', replaces: 'เครื่องปรุง' }
      ]
    }
  },
  {
    id: 6,
    name: 'ข้าวหมูหวาน',
    cal: 650, carb: 60, prot: 32, fat: 32,
    meal: 'breakfast',
    tags: ['balance'],
    ingredients: {
      base: ['กระเทียม', 'ซีอิ๊ว', 'น้ำปลา', 'หมูสามชั้น'],
      traditional: ['น้ำตาลปี๊บ'],
      alternative: [
        { name: 'น้ำตาลจาก', replaces: 'น้ำตาลปี๊บ' },
        { name: 'น้ำตาลโตนด', replaces: 'น้ำตาลปี๊บ' }
      ]
    }
  }
];

// ฐานข้อมูลสารอาหารส่วนต่าง (อ้างอิงจากชื่อ name ใน alternative)
const INGREDIENT_DIFF_DB = {
  'น้ำตาลโตนด': { cal: -15, carb: -4, prot: 0, fat: 0 },
  'น้ำตาลจาก': { cal: -10, carb: -2, prot: 0, fat: 0 },
  'ผงแป้งกล้วย': { cal: -20, carb: -5, prot: 1, fat: 0 },
  'ผงแป้งกล้วยน้ำว้าดิบ': { cal: -20, carb: -5, prot: 1, fat: 0 },
  'น้ำมันมะพร้าว': { cal: -20, carb: 0, prot: 0, fat: -2 },
  'เนย': { cal: 0, carb: 0, prot: 0, fat: 0 }, 
  'น้ำมันมะกอก': { cal: +20, carb: 0, prot: 0, fat: +2 },
  'ผงไชยา': { cal: +5, carb: 1, prot: 2, fat: 0 },
  'โปรตีนพืช': { cal: +40, carb: 0, prot: 10, fat: 0 },
  'น้ำผึ้งชันโรง': { cal: -10, carb: -3, prot: 0, fat: 0 }
};