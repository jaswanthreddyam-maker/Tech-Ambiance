import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  email: string;
  name: string;
  avatarUrl?: string;
  role: "client" | "admin";
}

export interface Project {
  id: string;
  name: string;
  status: "Discovery" | "Design" | "Development" | "Testing" | "Launch" | "Complete";
  progress: number; // 0 to 100
  startDate: string;
  deliveryDate: string;
  budget: string;
  activeMilestone: string;
  milestones: { id: string; name: string; date: string; status: "completed" | "active" | "pending" }[];
  invoices: { id: string; amount: string; date: string; status: "Paid" | "Pending" | "Overdue" }[];
  sourceCode?: string;
  demoUrl?: string;
  supportTickets: { id: string; subject: string; status: "Open" | "Resolved"; date: string }[];
}

interface AuthContextType {
  user: User | null;
  project: Project | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock project for demonstration
const mockProject: Project = {
  id: "proj-1",
  name: "Cafe Vistaara Premium Website",
  status: "Development",
  progress: 68,
  startDate: "2026-06-01",
  deliveryDate: "2026-08-15",
  budget: "$12,500 USD",
  activeMilestone: "Front-end Animations & Core Framework Implementation",
  milestones: [
    { id: "m1", name: "Discovery & Brand Identity Strategy", date: "2026-06-10", status: "completed" },
    { id: "m2", name: "High-Fidelity UI/UX Web Layout Designs", date: "2026-06-25", status: "completed" },
    { id: "m3", name: "Core Front-end React + Tailwind Setup", date: "2026-07-05", status: "completed" },
    { id: "m4", name: "Animations, Transitions & Motion Details", date: "2026-07-20", status: "active" },
    { id: "m5", name: "SEO Optimizations & Lighthouse Verification", date: "2026-08-01", status: "pending" },
    { id: "m6", name: "Launch & Production Server Handover", date: "2026-08-15", status: "pending" },
  ],
  invoices: [
    { id: "inv-001", amount: "$5,000.00", date: "2026-06-02", status: "Paid" },
    { id: "inv-002", amount: "$3,750.00", date: "2026-07-01", status: "Paid" },
    { id: "inv-003", amount: "$3,750.00", date: "2026-08-10", status: "Pending" },
  ],
  sourceCode: "https://github.com/techambiance/cafe-vistaara",
  demoUrl: "https://vistaara.experience.techambiance.com",
  supportTickets: [
    { id: "t-001", subject: "Integrate custom reservation widgets", status: "Resolved", date: "2026-06-28" },
    { id: "t-002", subject: "Review custom hover animation parameters on mobile viewports", status: "Open", date: "2026-07-07" },
  ],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is saved in localStorage (mock persistence)
    const storedUser = localStorage.getItem("ta_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setProject(mockProject);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate luxury loading latency (1.5s)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockUser: User = {
      email,
      name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      role: "client",
    };

    setUser(mockUser);
    setProject(mockProject);
    localStorage.setItem("ta_user", JSON.stringify(mockUser));
    setIsLoading(false);
    return true;
  };

  const signup = async (email: string, name: string, _: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockUser: User = {
      email,
      name,
      role: "client",
    };

    setUser(mockUser);
    setProject(mockProject);
    localStorage.setItem("ta_user", JSON.stringify(mockUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    setProject(null);
    localStorage.removeItem("ta_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        project,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
