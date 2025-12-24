/**
 * FAQ Data — Bilingual (ZH-TW / EN)
 * 
 * Phase 1 Finalized Policies:
 * - Bank transfer only, 24hr deadline, last 5 digits confirmation
 * - Shipping: NT$60 (7-11), NT$80 (Post), free over NT$2000
 * - Shelf life: up to 2 weeks sealed
 * - No deposit, no invoices, no bulk discounts
 * - Contact: Facebook「香甜手作」
 */

export interface FAQItem {
    question: { zh: string; en: string };
    answer: { zh: string; en: string };
}

export interface FAQCategory {
    title: { zh: string; en: string };
    items: FAQItem[];
}

export const faqData: FAQCategory[] = [
    {
        title: { zh: "訂購與付款", en: "Ordering & Payment" },
        items: [
            {
                question: {
                    zh: "如何下單？",
                    en: "How do I place an order?"
                },
                answer: {
                    zh: "瀏覽商品，選擇款式與數量，加入購物車後結帳。需使用 Google 帳號登入完成訂單。",
                    en: "Browse our products, select your designs and quantities, add to cart, then checkout. You'll need to log in with your Google account to complete your order."
                }
            },
            {
                question: {
                    zh: "最低訂購量是多少？",
                    en: "What is the minimum order requirement?"
                },
                answer: {
                    zh: "• 每款設計至少 10 個\n• 訂單總金額至少 NT$500",
                    en: "• Each design requires a minimum of 10 units\n• Total order subtotal must be at least NT$500"
                }
            },
            {
                question: {
                    zh: "接受哪些付款方式？",
                    en: "What payment methods do you accept?"
                },
                answer: {
                    zh: "目前僅接受銀行轉帳。下單後會收到匯款資訊通知信。",
                    en: "We accept bank transfer only. After placing your order, you'll receive our bank details via email."
                }
            },
            {
                question: {
                    zh: "付款期限是多長？",
                    en: "How long do I have to pay?"
                },
                answer: {
                    zh: "請於下單後 24 小時內完成付款，逾時訂單將自動取消。",
                    en: "Please complete your payment within 24 hours of placing your order. Orders without payment will be automatically cancelled."
                }
            },
            {
                question: {
                    zh: "如何確認付款？",
                    en: "How do I confirm my payment?"
                },
                answer: {
                    zh: "轉帳後請回覆訂單確認信，提供轉帳帳號末 5 碼。我們會在 1-2 個工作天內完成對帳。",
                    en: "After transferring, please reply to your order confirmation email with the last 5 digits of your bank transfer. We'll verify and confirm within 1-2 business days."
                }
            },
            {
                question: {
                    zh: "訂單資訊錯誤怎麼辦？",
                    en: "What if my order information is wrong?"
                },
                answer: {
                    zh: "如發現訂單資訊有誤，請立即回覆訂單確認信，我們會盡力在製作前協助處理。",
                    en: "Please reply to the order confirmation email immediately if you notice any errors. We'll do our best to help before production begins."
                }
            }
        ]
    },
    {
        title: { zh: "配送與運費", en: "Shipping & Delivery" },
        items: [
            {
                question: {
                    zh: "有哪些配送方式？",
                    en: "What shipping methods are available?"
                },
                answer: {
                    zh: "• 7-11 超商取貨 — NT$60\n• 郵局/宅配 — NT$80\n\n訂單滿 NT$2,000 免運費！",
                    en: "• 7-11 Store Pickup — NT$60\n• Post Office / Courier — NT$80\n\nOrders over NT$2,000 qualify for free shipping!"
                }
            },
            {
                question: {
                    zh: "出貨需要多久？",
                    en: "How long does shipping take?"
                },
                answer: {
                    zh: "付款確認後約 2 個工作天內出貨。實際到貨時間依配送方式而定，無法保證確切送達日期。",
                    en: "We dispatch within ~2 business days after your payment is confirmed. Actual delivery time depends on the carrier — we cannot guarantee exact delivery dates."
                }
            },
            {
                question: {
                    zh: "可以選擇希望收貨日期嗎？",
                    en: "Can I choose my delivery date?"
                },
                answer: {
                    zh: "可以！結帳時可選擇希望的日期，但需注意：\n• 至少需要 14 天前置作業時間\n• 僅週末可製作（除非有特別開放的日期）",
                    en: "Yes! During checkout, you can select your preferred date. Please note:\n• Minimum 14 days lead time required\n• Production available on weekends only (unless special dates are opened)"
                }
            }
        ]
    },
    {
        title: { zh: "保存與賞味期限", en: "Storage & Shelf Life" },
        items: [
            {
                question: {
                    zh: "蛋白霜餅乾如何保存？",
                    en: "How should I store my meringues?"
                },
                answer: {
                    zh: "請存放於陰涼乾燥處，避免潮濕。食用前請保持密封。",
                    en: "Store in a cool, dry place away from humidity. Keep sealed until ready to consume."
                }
            },
            {
                question: {
                    zh: "蛋白霜餅乾可以放多久？",
                    en: "How long do meringues last?"
                },
                answer: {
                    zh: "密封保存最多可維持 2 週的新鮮口感。",
                    en: "When stored properly and kept sealed, meringues stay fresh for up to 2 weeks."
                }
            },
            {
                question: {
                    zh: "可以冷凍保存嗎？",
                    en: "Can I freeze meringues?"
                },
                answer: {
                    zh: "不建議冷凍，可能會影響口感與外觀。",
                    en: "We don't recommend freezing as it may affect texture and appearance."
                }
            }
        ]
    },
    {
        title: { zh: "退換貨與售後", en: "Returns & After-Sales" },
        items: [
            {
                question: {
                    zh: "可以退貨或退款嗎？",
                    en: "Can I return or get a refund?"
                },
                answer: {
                    zh: "因產品為手工製作且易碎：\n• 不接受退貨\n• 「與想像不同」或顏色/造型些微差異不予退款\n• 運送損壞將個案處理",
                    en: "Due to the handmade and perishable nature of our products:\n• No returns are accepted\n• No refunds for \"different from imagination\" or minor variations\n• Damage during shipping is handled case-by-case"
                }
            },
            {
                question: {
                    zh: "收到商品損壞怎麼辦？",
                    en: "What if my order arrives damaged?"
                },
                answer: {
                    zh: "請於收貨後 24 小時內透過 Facebook 聯繫我們並附上照片。我們會視情況評估是否提供部分補償。",
                    en: "Please contact us via Facebook within 24 hours of delivery with photos. We'll review and may offer partial compensation at our discretion."
                }
            },
            {
                question: {
                    zh: "可以取消訂單嗎？",
                    en: "Can I cancel my order?"
                },
                answer: {
                    zh: "• 付款前：可以免費取消\n• 付款確認後：若已開始製作則無法取消",
                    en: "• Before payment: Yes, free cancellation\n• After payment confirmed: Cancellation may not be possible once production has started"
                }
            }
        ]
    },
    {
        title: { zh: "客製化與大量訂購", en: "Custom & Bulk Orders" },
        items: [
            {
                question: {
                    zh: "可以客製化設計嗎？",
                    en: "Can I request custom designs?"
                },
                answer: {
                    zh: "目前僅提供現有款式，不提供預覽圖或試做。若有特殊需求歡迎聯繫討論。",
                    en: "We work from our existing design catalog. No preview or trial drawings are provided. Minor customization requests may be considered — contact us to discuss."
                }
            },
            {
                question: {
                    zh: "大量訂購有優惠嗎？",
                    en: "Do you offer bulk/corporate discounts?"
                },
                answer: {
                    zh: "現階段不提供大量或企業訂購優惠，所有訂單均依標準價格計費。",
                    en: "No bulk or corporate pricing is available at this stage. All orders follow standard pricing."
                }
            },
            {
                question: {
                    zh: "每個餅乾都一模一樣嗎？",
                    en: "Is every piece exactly the same?"
                },
                answer: {
                    zh: "每個蛋白霜餅乾皆為手工製作，顏色、大小、形狀會有些微差異，這正是手作的獨特魅力。",
                    en: "Each meringue is handmade, so minor variations in color, size, and shape are normal and part of the handcrafted charm."
                }
            }
        ]
    },
    {
        title: { zh: "發票與收據", en: "Invoices & Receipts" },
        items: [
            {
                question: {
                    zh: "可以開立發票嗎？",
                    en: "Do you provide invoices?"
                },
                answer: {
                    zh: "現階段不開立發票。訂單確認信與銀行轉帳紀錄可作為交易憑證。",
                    en: "We do not issue invoices at this stage. Your order confirmation email and bank transfer record serve as your purchase documentation."
                }
            }
        ]
    },
    {
        title: { zh: "食品資訊（成分與過敏原）", en: "Food Info (Ingredients & Allergens)" },
        items: [
            {
                question: {
                    zh: "蛋白霜餅乾的成分是什麼？",
                    en: "What are meringues made of?"
                },
                answer: {
                    zh: "主要成分為蛋白、糖及食用色素。詳細成分因款式而異。",
                    en: "Our meringues are made from egg whites, sugar, and food-grade coloring. Specific ingredients vary by design."
                }
            },
            {
                question: {
                    zh: "有過敏原嗎？",
                    en: "Are your products suitable for people with allergies?"
                },
                answer: {
                    zh: "產品含蛋。製作環境可能處理堅果、乳製品及麩質。對蛋過敏者不適合食用。",
                    en: "Our products contain eggs and are produced in a facility that may process nuts, dairy, and gluten. Not suitable for those with egg allergies."
                }
            },
            {
                question: {
                    zh: "素食者可以食用嗎？",
                    en: "Are your products vegetarian/vegan?"
                },
                answer: {
                    zh: "蛋白霜餅乾屬於蛋奶素（含蛋），不適合純素食者。",
                    en: "Meringues are vegetarian (egg-based) but not vegan."
                }
            }
        ]
    },
    {
        title: { zh: "聯絡我們", en: "Contact Us" },
        items: [
            {
                question: {
                    zh: "如何聯繫你們？",
                    en: "How can I reach you?"
                },
                answer: {
                    zh: "請搜尋 Facebook 粉絲專頁「香甜手作」並傳送私訊，我們會儘快回覆！",
                    en: "Please search our Facebook page「香甜手作」and send us a private message. We'll respond as soon as possible!"
                }
            }
        ]
    }
];

export default faqData;
