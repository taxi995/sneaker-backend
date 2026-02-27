const express = require('express');
const cors = require('cors');
// Điền Secret Key của bạn vào đây (Bắt đầu bằng sk_test_...)
const stripe = require('stripe')('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'); 

const app = express();

// Cho phép Frontend (HTML) gọi API đến Backend mà không bị lỗi CORS
app.use(cors()); 
// Cho phép đọc dữ liệu JSON gửi lên từ Frontend
app.use(express.json());

// Tạo API endpoint để Frontend gọi đến
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { items } = req.body; // Lấy giỏ hàng từ Frontend

        // 1. Chuyển đổi giỏ hàng sang định dạng mà Stripe yêu cầu (line_items)
        const lineItems = items.map(item => {
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        // Tên hiển thị trên trang thanh toán Stripe
                        name: `${item.product.name} (Color: ${item.color}, Size: US ${item.size})`,
                        images: [item.product.image], // Hiển thị ảnh giày
                    },
                    // Stripe tính tiền bằng cent ($1 = 100 cents) nên phải nhân với 100
                    unit_amount: Math.round(item.product.price * 100), 
                },
                quantity: 1, // Số lượng mỗi dòng sản phẩm
            };
        });

        // 2. Tạo Checkout Session với Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            // URL chuyển về khi thanh toán THÀNH CÔNG (Thay đổi port 5500 cho khớp với port bạn đang mở file HTML)
            success_url: 'https://sneakers-e9c01.web.app/index.html?status=success', 
            // URL chuyển về khi khách hàng bấm HỦY (Quay lại trang chủ)
            cancel_url: 'https://sneakers-e9c01.web.app/index.html?status=cancel',
        });

        // 3. Trả Session ID về cho Frontend
        res.json({ id: session.id });

    } catch (error) {
        console.error("Lỗi tạo session:", error);
        res.status(500).json({ error: error.message });
    }
});

// Chạy server ở cổng 4242
const PORT = 4242;
app.listen(PORT, () => {
    console.log(`Node.js server đang chạy tại: http://localhost:${PORT}`);
});