UPDATE public.products
SET original_price_usd = 25.00,
    original_price_xcd = 67.50,
    price_usd = 12.50,
    price_xcd = 33.75,
    promotion_badge = '50% OFF',
    promotion_text = 'Limited Time Sale — 50% Off The Answer'
WHERE slug = 'the-answer';