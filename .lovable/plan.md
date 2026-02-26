

# WooCommerce Integration Plan

## Overview
Connect your Lovable store to your WooCommerce backend so product data, pricing, and orders stay in sync. Your Lovable site remains the beautiful frontend; WooCommerce handles payment processing and fulfillment.

## Step 1: Store API Keys Securely
Save your WooCommerce Consumer Key and Consumer Secret as secure backend secrets (never exposed in frontend code).

## Step 2: Create a WooCommerce Sync Edge Function
Build a backend function (`woo-sync`) that:
- Connects to your WooCommerce REST API at `mountkailashslu.com/wp-json/wc/v3/`
- Pulls all products, prices, stock status, and categories
- Updates your existing database products table with the latest WooCommerce data
- Can be triggered manually from your admin panel or on a schedule

### What it syncs:
- Product names, descriptions, images
- Prices (USD) with automatic XCD conversion at 2.70 rate
- Stock status (in stock / out of stock)
- Categories

## Step 3: Create a WooCommerce Order Function
Build a backend function (`woo-order`) that:
- Takes a completed cart from your Lovable checkout
- Creates an order in WooCommerce via the REST API
- Returns the WooCommerce order ID and payment link
- Redirects the customer to WooCommerce checkout for payment

## Step 4: Admin Sync Button
Add a "Sync from WooCommerce" button to your existing admin products page so you can manually trigger a product sync whenever you update products on the WordPress side.

## Technical Details

### Edge Functions Created:
1. **`woo-sync`** — fetches products from WooCommerce API, upserts into your database
2. **`woo-order`** — creates WooCommerce orders from Lovable cart data

### Secrets Stored:
- `WOO_CONSUMER_KEY` — your consumer key
- `WOO_CONSUMER_SECRET` — your consumer secret  
- `WOO_STORE_URL` — `https://mountkailashslu.com`

### No changes needed to:
- Your existing product display pages (Shop, ProductDetail)
- Your cart system
- Your existing database schema (products table already has all needed fields)

