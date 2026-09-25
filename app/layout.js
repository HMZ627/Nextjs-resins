import './globals.css';

export const metadata = {
  title: 'Resins by R | Handcrafted Resin Art & Custom Gifts',
  description: 'Custom handcrafted resin rings, wall clocks, resin shields, and custom photo coasters made with premium epoxy resin.',
  keywords: ['Resins by R', 'Resin Art', 'Custom Resin Ring', 'Resin Clock', 'Resin Shield', 'Handmade Gifts Pakistan'],
  authors: [{ name: 'Resins by R' }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased selection:bg-pink-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
