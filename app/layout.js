import "./globals.css";
import { Open_Sans } from "next/font/google";

const inter = Open_Sans({ weight: "400", subsets: ["latin"] });

export const metadata = {
  title: "Midas Touch Creations",
  description: "Created by Arjun R.",
};

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
