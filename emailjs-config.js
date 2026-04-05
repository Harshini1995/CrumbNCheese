// ============================================
// EmailJS Configuration — Crumb & Cheese
// ============================================
// Replace these with your actual EmailJS credentials.
// Get them from https://www.emailjs.com/ after signing up (free).
//
// SETUP STEPS:
// 1. Sign up at https://www.emailjs.com/
// 2. Dashboard → Email Services → Add Service → Gmail
//    - Connect your Gmail: 22harshu@gmail.com
//    - Note the SERVICE ID (e.g., 'service_abc123')
//
// 3. Dashboard → Email Templates → Create New Template
//    - Subject: "🧁 New Order from Crumb & Cheese! — {{customer_name}}"
//    - Body (paste this):
//
//      New Order from Crumb & Cheese Website!
//      ─────────────────────────────────────────
//
//      Customer: {{customer_name}}
//      Phone: {{customer_phone}}
//      Email: {{customer_email}}
//      Address: {{delivery_address}}
//
//      Delivery Date: {{delivery_date}}
//      Special Instructions: {{special_instructions}}
//
//      Order Items:
//      {{order_items}}
//
//      Total: {{total_amount}}
//      Transaction ID: {{transaction_id}}
//      Order Time: {{order_time}}
//
//    - To Email: 22harshu@gmail.com
//    - Note the TEMPLATE ID (e.g., 'template_xyz789')
//
// 4. Dashboard → Account → Public Key
//    - Copy the PUBLIC KEY (e.g., 'pK_AbCdEfGhIjK')
//
// 5. Paste all three values below:
// ============================================

const EMAILJS_SERVICE_ID  = 'your_service_id';   // e.g., 'service_abc123'
const EMAILJS_TEMPLATE_ID = 'your_template_id';  // e.g., 'template_xyz789'
const EMAILJS_PUBLIC_KEY  = 'your_public_key';   // e.g., 'pK_AbCdEfGhIjK'
