import "@/styles/globals.css";
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from "../context/CartContext";
import { ThemeProvider } from '../context/ThemeContext';
import Header from '../components/Header';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isSpecialPage = router.pathname.startsWith('/admin') || router.pathname.startsWith('/dashboard') || router.pathname.startsWith('/cart') || router.pathname.startsWith('/history') || router.pathname.startsWith('/checkout');

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          {!isSpecialPage && <Header />}
          <main className={!isSpecialPage ? "pt-20 bg-gray-900" : ""}>
            <Component {...pageProps} />
          </main>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
