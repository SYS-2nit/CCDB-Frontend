import axios from "axios";

export interface Member {
  id: number;
  username: string;
  email: string;
  company: string;
  slackAddress?: string | null;
  warningChannel?: string | null;
  dangerChannel?: string | null;
  criticalChannel?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const fetchMembers = async (): Promise<Member[]> => {
  const res = await axios.get("http://localhost:8080/api/members");
  return res.data.data;
};
