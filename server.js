const express = require('express');
const cors = require('cors');

// Cấu hình Stripe Secret Key (BẮT BUỘC DÙNG sk_live_...)
const stripe = require('stripe')('mk_1T5fItK5zw3LGVcwih92BR4e'); 

const app = express();

app.use(cors()); 
app.use(express.json());

// API tạo Payment Intent cho Stripe Elements
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { items, shipping } = req.body; 

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Your cart is empty" });
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
        console.error("Payment Intent Error:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại cổng ${PORT}`);
});