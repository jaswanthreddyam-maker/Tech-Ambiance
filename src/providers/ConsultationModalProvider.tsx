import React, { createContext, useContext, useState } from "react";
import { StrategyConsultationModal } from "../components/organisms/StrategyConsultationModal";

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

  const openConsultationModal = () => setIsOpen(true);
  const closeConsultationModal = () => setIsOpen(false);

  return (
    <ConsultationModalContext.Provider
      value={{ isOpen, openConsultationModal, closeConsultationModal }}
    >
      {children}
      <StrategyConsultationModal isOpen={isOpen} onClose={closeConsultationModal} />
    </ConsultationModalContext.Provider>
  );
};
