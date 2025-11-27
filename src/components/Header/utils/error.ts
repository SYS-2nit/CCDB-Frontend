import { isAxiosError } from "axios";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "알 수 없는 오류가 발생했습니다.";
};
