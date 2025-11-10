import axios from "axios";

export interface SqlResponse {
  id: number;
  instanceId: number;
  field3: string;
  field4: string;
  field5: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

/**
 * SQL 리스트 조회 (더미 데이터)
 */
export const getSqlList = async (): Promise<SqlResponse[]> => {
  try {
    const res = await axios.get<ApiResponse<SqlResponse[]>>("/api/sql/list");
    console.log("✅ [API] SQL 리스트 응답:", res.data);
    return res.data.data;
  } catch (error) {
    console.error("❌ [API] SQL 리스트 요청 실패:", error);
    throw error;
  }
};

/**
 * SQL 등록 (테스트용)
 */
export const createSql = async (payload: {
  instanceId: number;
  field3: string;
  field4: string;
  field5: string;
}) => {
  try {
    const res = await axios.post<ApiResponse<SqlResponse>>("/api/sql", payload);
    console.log("✅ [API] SQL 등록 성공:", res.data);
    return res.data.data;
  } catch (error) {
    console.error("❌ [API] SQL 등록 실패:", error);
    throw error;
  }
};
