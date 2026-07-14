import React from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "./AuthProvider";
import { PermissionProvider } from "../auth/providers/PermissionProvider";
import { ScrollProvider } from "./ScrollProvider";
import { CursorProvider } from "./CursorProvider";
import { SEOProvider } from "./SEOProvider";
import { ToastProvider } from "./ToastProvider";
import { MotionProvider } from "./MotionProvider";
import { ConsultationModalProvider } from "./ConsultationModalProvider";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <SEOProvider>
        <AuthProvider>
          <PermissionProvider>
            <ScrollProvider>
              <CursorProvider>
                <ToastProvider>
                  <MotionProvider>
                    <ConsultationModalProvider>
                      {children}
                    </ConsultationModalProvider>
                  </MotionProvider>
                </ToastProvider>
              </CursorProvider>
            </ScrollProvider>
          </PermissionProvider>
        </AuthProvider>
      </SEOProvider>
    </QueryClientProvider>
  );
};
