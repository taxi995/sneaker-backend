const express = require('express');
const cors = require('cors');

// DÙNG SECRET KEY (sk_live_...) Ở ĐÂY TRONG SERVER BẮT BUỘC
const stripe = require('stripe')('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'); 

const app = express();

app.use(cors()); 
app.use(express.json());

// API tạo Payment Intent cho khung nhập thẻ trực tiếp (Không dùng checkout.sessions.create nữa)
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { items, shipping } = req.body; 

        // Tính tổng tiền (Tiền hàng + Phí ship)
        let totalAmount = items.reduce((sum, item) => sum + item.product.price, 0);
        totalAmount += (shipping || 0);

        // Tạo PaymentIntent với số tiền chính xác
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100), // Stripe tính bằng cent ($1 = 100 cent)
            currency: 'usd',
            payment_method_types: ['card'],
        });

        // Trả mã bảo mật client_secret về cho HTML để mở khóa ô nhập thẻ
        res.json({ clientSecret: paymentIntent.client_secret });

    } catch (error) {
        console.error("Lỗi:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại cổng ${PORT}`);
});

Chúc bạn buôn may bán đắt với cửa hàng này nhé! Nếu trong quá trình nhập liệu Google Sheets có bị lỗi gì, cứ nhắn cho tôi!