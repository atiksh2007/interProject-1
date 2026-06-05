import { useState, useEffect } from "react";
import api from "../api";
export const useEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetch = async () => {
    setLoading(true);
    try { setEmployees((await api.get("/employees")).data); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);
  return { employees, loading, refetch: fetch };
};
