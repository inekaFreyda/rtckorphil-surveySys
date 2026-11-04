import "./globals.css";

export const metadata = {
  title: "TESDA Client Satisfaction Measurement",
  description: "Help us serve you better.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="uk-theme-blue">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/franken-ui@^2.0.0/dist/css/core.min.css" />
        <script src="https://unpkg.com/franken-ui@^2.0.0/dist/js/core.iife.js" type="module" />
      </head>
      <body>{children}</body>
    </html>
  );
}
