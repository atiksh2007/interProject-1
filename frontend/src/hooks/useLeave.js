import { useState, useCallback } from "react";
import api from "../api";
export const useLeave = () => {
  const [myLeaves, setMyLeaves] = useState([]);
  const [balance, setBalance] = useState([]);
  const fetchMy = useCallback(async () => setMyLeaves((await api.get("/leaves/my")).data), []);
  const fetchBalance = useCallback(async () => setBalance((await api.get("/leaves/balance")).data), []);
  const apply = async (d) => { await api.post("/leaves/apply", d); await fetchMy(); await fetchBalance(); };
  const cancel = async (id) => { await api.put(`/leaves/${id}/cancel`); await fetchMy(); };
  return { myLeaves, balance, fetchMy, fetchBalance, apply, cancel };
};
