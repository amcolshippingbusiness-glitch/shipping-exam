# Shipping Exam (GitHub Pages + Google Sheet)

โปรเจกต์นี้คือเว็บ Static (GitHub Pages) ที่เก็บข้อมูลไว้ใน Google Sheet ผ่าน Google Apps Script Web App

## โครงสร้างไฟล์
- `index.html` หน้าเว็บ
- `app.js` โค้ดหลักของระบบ
- `_sdk/data_sdk.js` ตัวเชื่อมไป Google Apps Script (ต้องใส่ URL)
- `_sdk/element_sdk.js` stub
- `apps_script/Code.gs` โค้ด Apps Script ให้ก็อปไปวาง

## จุดที่ต้องตั้งค่า
1) เปิดไฟล์ `_sdk/data_sdk.js`
2) ใส่ URL ของ Google Apps Script Web App ที่ Deploy แล้ว ในตัวแปร `GAS_WEBAPP_URL`

