import "../styles/globals.css";
import "../styles/admin.css";
import { AuthProvider } from "../contexts/AuthContext";
import { ToastProvider } from "../contexts/ToastContext";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <div style={{ minHeight: '100vh' }}>
          <Component {...pageProps} />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
