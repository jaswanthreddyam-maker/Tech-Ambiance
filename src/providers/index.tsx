import React from "react";
import { AuthProvider } from "./AuthProvider";
import { ScrollProvider } from "./ScrollProvider";
import { CursorProvider } from "./CursorProvider";
import { SEOProvider } from "./SEOProvider";
import { ToastProvider } from "./ToastProvider";
import { MotionProvider } from "./MotionProvider";
import { ConsultationModalProvider } from "./ConsultationModalProvider";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SEOProvider>
      <AuthProvider>
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
      </AuthProvider>
    </SEOProvider>
  );
};
