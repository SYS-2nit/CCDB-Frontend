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

export interface UpdateMemberRequest {
  username: string;
  email: string;
  company: string;
}

// 전체 회원 조회 API
export const fetchMembers = async (): Promise<Member[]> => {
  const res = await axios.get("/api/members");
  return res.data.data;
};

// 회원 수정 API
export const updateMember = async (id: number, body: UpdateMemberRequest) => {
  const res = await axios.put(`/api/members/${id}`, body);
  return res.data;
};
