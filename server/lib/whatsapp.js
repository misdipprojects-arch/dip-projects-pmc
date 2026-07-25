const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID;
const META_ACCESS_TOKEN    = process.env.META_ACCESS_TOKEN;

async function sendWhatsAppTemplate(toNumber, templateName, bodyParams = []) {
  if (!toNumber) return; // number missing hai — chup chaap skip karo
  if (!META_PHONE_NUMBER_ID || !META_ACCESS_TOKEN) {
    console.error('WhatsApp not configured — missing env vars');
    return;
  }
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${META_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: toNumber,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [{
            type: 'body',
            parameters: bodyParams.map(text => ({ type: 'text', text: String(text) }))
          }]
        }
      })
    });
    const data = await res.json();
    if (!res.ok) console.error('WhatsApp send failed:', JSON.stringify(data));
    else console.log('WhatsApp sent to', toNumber, '-', templateName);
  } catch (err) {
    console.error('WhatsApp send error:', err.message);
  }
}

module.exports = { sendWhatsAppTemplate };
