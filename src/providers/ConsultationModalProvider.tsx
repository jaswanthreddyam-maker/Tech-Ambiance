import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { StrategyConsultationModal } from "../components/organisms/StrategyConsultationModal";
import { useAuth } from "../auth/hooks/useAuth";
import { useToast } from "./ToastProvider";

interface ConsultationModalContextType {
  isOpen: boolean;
  openConsultationModal: () => void;
  closeConsultationModal: () => void;
}

const ConsultationModalContext = createContext<ConsultationModalContextType>({
  isOpen: false,
  openConsultationModal: () => {},
  closeConsultationModal: () => {},
});

export const useConsultationModal = () => useContext(ConsultationModalContext);

export const ConsultationModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const openConsultationModal = () => {
    if (!isAuthenticated) {
      toast("Please sign in or create an account to book a consultation.", "info");
      navigate("/auth?mode=signup&redirect=consultation");
      return;
    }
    setIsOpen(true);
  };

  const closeConsultationModal = () => setIsOpen(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("openConsultation") === "true") {
      if (isAuthenticated) {
        setIsOpen(true);
        searchParams.delete("openConsultation");
        const newSearch = searchParams.toString();
        const newUrl = location.pathname + (newSearch ? `?${newSearch}` : "") + location.hash;
        navigate(newUrl, { replace: true });
      } else {
        toast("Please sign in or create an account to book a consultation.", "info");
        navigate("/auth?mode=signup&redirect=consultation", { replace: true });
      }
    }
  }, [location.search, location.pathname, location.hash, isAuthenticated, navigate, toast]);

  return (
    <ConsultationModalContext.Provider
      value={{ isOpen, openConsultationModal, closeConsultationModal }}
    >
      {children}
      <StrategyConsultationModal isOpen={isOpen} onClose={closeConsultationModal} />
    </ConsultationModalContext.Provider>
  );
};
