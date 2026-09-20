import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AppRouter } from "./routes/AppRouter.jsx";
import { useNotificationSocket } from "./hooks/useNotificationSocket.js";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function AppContent() {
  useNotificationSocket();
  return (
    <>
      <AppRouter />
      <Toaster position="top-right" />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
