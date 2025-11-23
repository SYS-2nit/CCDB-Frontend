import { isAxiosError } from "axios";

/**
 * 에러 객체에서 사용자 친화적인 메시지 추출
 */
export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? "서버 요청 중 오류가 발생했습니다.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "알 수 없는 오류가 발생했습니다.";
};

/**
 * 에러 로깅 (개발 환경에서만 상세 로그)
 */
export const logError = (context: string, error: unknown): void => {
  const message = getErrorMessage(error);
  
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  } else {
    console.error(`[${context}] ${message}`);
  }
};

/**
 * SQL 관련 에러 메시지 매핑
 */
export const getSqlErrorMessage = (error: unknown, operation: string): string => {
  const baseMessage = getErrorMessage(error);
  
  const operationMap: Record<string, string> = {
    "그래프 데이터": "차트 데이터를 불러오는 중 오류가 발생했습니다.",
    "테이블 데이터": "테이블 데이터를 불러오는 중 오류가 발생했습니다.",
    "비교 리스트": "비교 데이터를 불러오는 중 오류가 발생했습니다.",
    "기간 그래프": "기간별 그래프 데이터를 불러오는 중 오류가 발생했습니다.",
    "SQL 상세": "SQL 상세 정보를 불러오는 중 오류가 발생했습니다.",
  };

  return operationMap[operation] ?? `${operation} 중 오류가 발생했습니다: ${baseMessage}`;
};

