// ══════════════════════════════════════════════════
//  foods.js · Food Database
// ══════════════════════════════════════════════════

const FOODS = [
  // breakfast
  { id:1,  name:'ข้าวกล้องต้มปลากะพงน้ำใส',              cal:240, carb:34, prot:20, fat:2,  meal:'breakfast', tags:['lose','healthy','balance'] },
  { id:2,  name:'แซนด์วิชโฮลวีตอกไก่ฉีก',                cal:310, carb:28, prot:26, fat:5,  meal:'breakfast', tags:['muscle','lose'] },
  { id:3,  name:'ไข่ต้ม 2 ฟอง + มันเผา 100g',             cal:265, carb:24, prot:14, fat:10, meal:'breakfast', tags:['lose','healthy'] },
  { id:4,  name:'กรีกโยเกิร์ต + สตรอว์เบอร์รี่ + กราโนล่า', cal:290, carb:32, prot:18, fat:8, meal:'breakfast', tags:['healthy','balance'] },
  { id:5,  name:'โจ๊กข้าวกล้องไก่สับ',                    cal:210, carb:30, prot:16, fat:3,  meal:'breakfast', tags:['balance','healthy'] },
  { id:6,  name:'สมูทตี้กล้วย + โปรตีนเวย์',              cal:330, carb:38, prot:28, fat:4,  meal:'breakfast', tags:['muscle'] },
  // lunch
  { id:7,  name:'ข้าวกะเพราอกไก่สับ + ไข่ดาวน้ำ',         cal:460, carb:55, prot:38, fat:8,  meal:'lunch', tags:['muscle','lose'] },
  { id:8,  name:'ข้าวกล้อง + สเต๊กแซลมอนย่าง 120g',       cal:495, carb:35, prot:32, fat:19, meal:'lunch', tags:['muscle','healthy'] },
  { id:9,  name:'เส้นหมี่ข้าวกล้องราดหน้าอกไก่',           cal:390, carb:48, prot:26, fat:6,  meal:'lunch', tags:['lose','balance'] },
  { id:10, name:'ข้าวมันไก่เนื้ออก (ไม่มีหนัง)',           cal:430, carb:52, prot:28, fat:10, meal:'lunch', tags:['healthy'] },
  { id:11, name:'ก๋วยเตี๋ยวต้มยำน้ำใสเนื้อไก่',            cal:350, carb:42, prot:24, fat:5,  meal:'lunch', tags:['balance','lose'] },
  { id:12, name:'ข้าวผัดกุ้งลีน (ไม่ใส่น้ำมันเกิน)',       cal:480, carb:60, prot:22, fat:11, meal:'lunch', tags:['muscle','healthy'] },
  // dinner
  { id:13, name:'แกงจืดเต้าหู้ไข่หมูสับ (ไม่รวมข้าว)',    cal:185, carb:6,  prot:16, fat:11, meal:'dinner', tags:['lose','healthy'] },
  { id:14, name:'สลัดทูน่า + ผักไฮโดรโปนิกส์',             cal:150, carb:12, prot:22, fat:2,  meal:'dinner', tags:['lose','balance'] },
  { id:15, name:'ข้าวกล้อง + ปลานิลนึ่งแจ่ว + ผักต้ม',    cal:320, carb:38, prot:26, fat:4,  meal:'dinner', tags:['healthy','lose','balance'] },
  { id:16, name:'สเต๊กอกไก่พริกไทยดำ + บรอกโคลีเนย',      cal:360, carb:14, prot:42, fat:14, meal:'dinner', tags:['muscle'] },
  { id:17, name:'ต้มยำกุ้งน้ำข้น (1 ชาม)',                 cal:200, carb:10, prot:18, fat:10, meal:'dinner', tags:['healthy','balance'] },
  { id:18, name:'ผัดผักรวม + เต้าหู้แข็งทอด',              cal:250, carb:20, prot:14, fat:12, meal:'dinner', tags:['healthy','balance'] },
  // snack
  { id:19, name:'อัลมอนด์อบ 30g',            cal:170, carb:6,  prot:6,  fat:15, meal:'snack', tags:['healthy','muscle'] },
  { id:20, name:'กล้วยหอม 1 ลูก',            cal:95,  carb:23, prot:1,  fat:0,  meal:'snack', tags:['healthy','lose'] },
  { id:21, name:'เวย์โปรตีน 1 สกู๊ป + น้ำ', cal:120, carb:2,  prot:27, fat:1,  meal:'snack', tags:['muscle'] },
  { id:22, name:'มะละกอสุก 100g',             cal:45,  carb:11, prot:0,  fat:0,  meal:'snack', tags:['balance','lose'] },
  { id:23, name:'ไข่ต้ม 1 ฟอง',              cal:78,  carb:1,  prot:6,  fat:5,  meal:'snack', tags:['muscle','lose'] },
  { id:24, name:'แอปเปิ้ล 1 ลูกกลาง',        cal:80,  carb:21, prot:0,  fat:0,  meal:'snack', tags:['healthy','balance'] },
];
