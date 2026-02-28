const express = require('express');
const cors = require('cors');

// =========================================================================
// LƯU Ý QUAN TRỌNG NHẤT:
// Khóa Secret dưới đây PHẢI lấy từ cùng một tài khoản Stripe 
// với khóa Publishable (pk_live_...) mà bạn đặt trong file HTML.
// Ở đây chúng ta sử dụng mã mk_live_ như bạn đã cung cấp.
// =========================================================================
const STRIPE_SECRET_KEY = 'mk_1T5OLoGkQs1hUKAxjnBJhJtz'; // Thay bằng toàn bộ mã mk_live_ của bạn

const stripe = require('stripe')(STRIPE_SECRET_KEY); 

const app = express();

app.use(cors()); 
app.use(express.json());

// API tạo Payment Intent cho Stripe Elements
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { items, shipping } = req.body; 

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Giỏ hàng của bạn đang trống" });
        }

        // Tính tổng tiền (Tiền hàng + Phí ship)
        let totalAmount = items.reduce((sum, item) => sum + item.product.price, 0);
        totalAmount += (shipping || 0);

        // Tạo PaymentIntent với số tiền chính xác
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100), // Stripe tính bằng cent ($1 = 100 cent)
            currency: 'usd',
            payment_method_types: ['card'],
        });

        // Trả mã bảo mật client_secret về cho Frontend
        res.json({ clientSecret: paymentIntent.client_secret });

    } catch (error) {
        console.error("Lỗi Payment Intent:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại cổng ${PORT}`);
});