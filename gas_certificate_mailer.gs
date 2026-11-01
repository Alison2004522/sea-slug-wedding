/**
 * =========================================================================
 * 專案名稱：《海蛞蝓愛海蛞蝓：波光城最閃亮的婚禮》
 * 檔案功能：Google Apps Script 證書自動郵件發送器 (Web App)
 * 資安規範：遵循最小權限原則，僅調用 MailApp，嚴格禁用 DriveApp，保護個資
 * 編碼格式：純 UTF-8（No BOM）
 * =========================================================================
 * 
 * 【部屬三步驟指引】：
 * 1. 開啟 Google Apps Script（https://script.google.com/）或 Google 試算表 > 擴充功能 > Apps Script。
 * 2. 清空現有代碼，將本檔案內容完整複製並貼上，儲存專案（例如命名為「波光城證書發送器」）。
 * 3. 點擊右上角「部署」 > 「新增部署作業」：
 *    - 種類選擇：「網頁應用程式 (Web App)」
 *    - 說明：波光城證書寄送服務
 *    - 執行身分：選擇「我 (Me)」
 *    - 誰可以存取：選擇「所有人 (Anyone)」（確保學生的瀏覽器可發送請求）
 * 4. 點擊「部署」，授權郵件發送權限後，複製產生的「網頁應用程式網址 (Web App URL)」。
 * 5. 將該網址貼入前端 app.js 最上方的 `window.GAS_EMAIL_ENDPOINT = "您的GAS網址";`，即可全自動發信！
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "未收到有效的郵件資料"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 解析前端傳入的 JSON 資料
    var payload = JSON.parse(e.postData.contents);
    var recipientEmail = (payload.email || "").trim();
    var studentCode = (payload.studentCode || "海洋探索家").trim();
    var imageBase64 = payload.imageBase64 || "";

    // 格式防呆校驗
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!recipientEmail || !emailRegex.test(recipientEmail)) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "電子郵件格式不正確"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (!imageBase64) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "未收到證書圖檔資料"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 清理 Base64 前綴並解碼為純記憶體 Blob
    var cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg);base64,/, "");
    var decodedBytes = Utilities.base64Decode(cleanBase64);
    var certFileName = "波光城榮譽證書_" + studentCode + ".png";
    var certAttachment = Utilities.newBlob(decodedBytes, "image/png", certFileName);

    // 郵件標題與溫暖內文
    var subject = "【波光城最閃亮的婚禮】親愛的 " + studentCode + "，您的專屬榮譽證書來囉！";
    
    var htmlBody = "" +
      "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;'>" +
        "<div style='text-align: center; margin-bottom: 20px;'>" +
          "<h2 style='color: #0284c7; margin-bottom: 8px;'>🌊 波光城最閃亮的婚禮 🌊</h2>" +
          "<p style='color: #64748b; font-size: 14px;'>性別平等・多元理解・生命教育線上互動繪本</p>" +
        "</div>" +
        "<div style='background: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #38bdf8; line-height: 1.8; color: #334155;'>" +
          "<p style='font-size: 16px;'><strong>親愛的 " + studentCode + "：</strong></p>" +
          "<p>恭喜你成功完成了《海蛞蝓愛海蛞蝓》全書的探索與挑戰！</p>" +
          "<p>在波光城的婚禮中，你學會了細心傾聽朋友的心聲、打破限制選擇的框架，並體會到了尊重與包容的美好力量。</p>" +
          "<p style='background: #fdf2f8; padding: 12px; border-radius: 6px; color: #9d174d; font-style: italic;'>" +
            "「願你也能成為一片溫柔的海，讓身邊每一個獨特的朋友，都能自在游動。」" +
          "</p>" +
          "<p style='margin-top: 16px;'>📎 <strong>您的專屬榮譽證書已夾帶在郵件附件中（PNG 圖檔），歡迎下載並永久保存！</strong></p>" +
        "</div>" +
        "<div style='text-align: center; margin-top: 24px; color: #94a3b8; font-size: 13px;'>" +
          "<p>亮亮、閃閃與波光城全體居民 敬贈</p>" +
        "</div>" +
      "</div>";

    // 發送郵件（僅使用 MailApp 服務，零硬碟存取）
    MailApp.sendEmail({
      to: recipientEmail,
      subject: subject,
      htmlBody: htmlBody,
      attachments: [certAttachment]
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "郵件發送成功"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 支援 GET 請求測試連線狀態
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    service: "波光城榮譽證書郵件發送端點",
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
