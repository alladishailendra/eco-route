import "./globals.css";

export const metadata = {
  title: "EcoRoute",
  description: "Smart route and vehicle health tracking platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
