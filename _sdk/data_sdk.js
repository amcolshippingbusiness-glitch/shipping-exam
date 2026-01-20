/*
  data_sdk.js (สำหรับ GitHub Pages)
  - เชื่อม Google Apps Script Web App ที่ผูกกับ Google Sheet
  - รองรับ init / create / update

  วิธีใช้:
  1) ไปที่ Google Apps Script แล้ว Deploy เป็น Web app
  2) นำ URL ที่ได้มาใส่ใน GAS_WEBAPP_URL ด้านล่าง
*/

(function () {
  const GAS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzk0dsrrWCiFSGJUJpXC32mPWUIYHtlP7NGHwmiAeoluvwRj20UEYTQ2v9f8gEWbKcM_w/exec";

  function assertUrl() {
    if (!GAS_WEBAPP_URL || GAS_WEBAPP_URL.includes("PUT_YOUR")) {
      throw new Error("กรุณาตั้งค่า GAS_WEBAPP_URL ใน /_sdk/data_sdk.js ก่อนใช้งาน");
    }
  }

  async function callGAS(payload) {
    assertUrl();
    const res = await fetch(GAS_WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    // Apps Script บางทีคืน text
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { isOk: false, error: "Invalid JSON from GAS", raw: text };
    }
    return json;
  }

  const api = {
    async init(handler) {
      try {
        const out = await callGAS({ action: "list" });
        if (out && out.isOk) {
          if (handler && typeof handler.onDataChanged === "function") {
            handler.onDataChanged(out.data || []);
          }
          return { isOk: true };
        }
        return { isOk: false, error: out?.error || "init failed" };
      } catch (e) {
        console.error(e);
        return { isOk: false, error: String(e?.message || e) };
      }
    },

    async create(record) {
      try {
        const out = await callGAS({ action: "create", record });
        return out && out.isOk ? { isOk: true } : { isOk: false, error: out?.error || "create failed" };
      } catch (e) {
        console.error(e);
        return { isOk: false, error: String(e?.message || e) };
      }
    },

    async update(record) {
      try {
        const out = await callGAS({ action: "update", record });
        return out && out.isOk ? { isOk: true } : { isOk: false, error: out?.error || "update failed" };
      } catch (e) {
        console.error(e);
        return { isOk: false, error: String(e?.message || e) };
      }
    },
  };

  window.dataSdk = api;
})();
