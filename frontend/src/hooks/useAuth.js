import { useAuthContext } from "../context/AuthContext";
export const useAuth = () => {
  const c = useAuthContext();
  return {
    ...c,
    isAdmin:c.user?.role === "admin",
    isHR:c.user?.role === "hr" || c.user?.role === "admin",
    isManager:c.user?.role === "manager" || c.user?.role === "admin",
    isEmployee: !!c.user,
  };
};
