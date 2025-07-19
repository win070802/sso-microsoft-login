const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Khởi tạo API client Gemini với API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Lấy model từ biến môi trường hoặc sử dụng fallback
const defaultModel = process.env.MODAL_AI || "gemini-1.5-pro";

// Hàm để kiểm tra kết nối với Gemini API
async function testGeminiConnection() {
    try {
        const model = genAI.getGenerativeModel({ model: defaultModel });
        const result = await model.generateContent("Test connection");
        return { success: true, modelName: defaultModel };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    genAI,
    testGeminiConnection,
    defaultModel
};
