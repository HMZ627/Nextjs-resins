import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Discord Webhook URL is not configured on server' },
        { status: 500 }
      );
    }

    let embed = {};

    if (data.type === 'order') {
      embed = {
        title: "🛒 NEW RESIN ORDER RECEIVED",
        color: 0x9333ea, // Purple
        fields: [
          { name: "Order ID", value: `\`${data.orderId}\``, inline: true },
          { name: "Product", value: data.productName, inline: true },
          { name: "Customer Name", value: data.customerName, inline: true },
          { name: "Phone Number", value: data.phone, inline: true },
          { name: "Shipping Address", value: data.address, inline: false },
          { name: "Custom Photo Added", value: data.hasCustomImage ? "Yes (+PKR 100)" : "No", inline: true },
          { name: "Total Price", value: `**PKR ${data.totalPrice}**`, inline: true },
          { name: "Transaction ID (TID)", value: `\`${data.transactionId}\``, inline: false },
        ],
        footer: { text: "Resins by R • Automated Order System" },
        timestamp: new Date().toISOString(),
      };
    } else if (data.type === 'review') {
      embed = {
        title: "⭐ NEW CLIENT REVIEW",
        color: 0x3b82f6, // Blue
        fields: [
          { name: "Name", value: data.name || "Anonymous", inline: true },
          { name: "Rating", value: "⭐".repeat(data.rating), inline: true },
          { name: "Feedback", value: data.feedback, inline: false },
        ],
        footer: { text: "Resins by R • Review System" },
        timestamp: new Date().toISOString(),
      };
    }

    // Send payload to Discord Webhook
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      throw new Error(`Discord API responded with status ${discordResponse.status}: ${errorText}`);
    }

    return NextResponse.json({ success: true, message: "Notification sent to Discord" });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
