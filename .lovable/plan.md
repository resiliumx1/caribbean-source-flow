

## Retry WooCommerce Sync

Now that you have Administrator access on both sites, we need to:

1. **Update the WooCommerce API secrets** with freshly generated keys from your WordPress admin (WooCommerce → Settings → Advanced → REST API → Add Key, with Read/Write permissions and an Administrator user).

2. **Redeploy and test the woo-sync function** to confirm the 401 error is resolved and products sync successfully.

3. **Verify synced products** appear correctly in the database with proper pricing, images, and WooCommerce IDs.

### What you need to do first

Before I can proceed, please:
1. Go to your WordPress admin at **mountkailashslu.com/wp-admin**
2. Navigate to **WooCommerce → Settings → Advanced → REST API**
3. Click **Add Key**
4. Set **Description** to `Lovable Store Integration`, **User** to your admin account, **Permissions** to **Read/Write**
5. Click **Generate API Key**
6. Copy both the **Consumer Key** and **Consumer Secret** immediately (the secret is only shown once)

Once approved, I will prompt you to enter the new keys and then test the sync.

### Technical Details

- The `woo-sync` edge function will be redeployed after updating secrets
- A test call will be made to verify the WooCommerce API responds with product data
- The `woo-order` function will also be tested to confirm order creation works end-to-end

