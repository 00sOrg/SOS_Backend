export default interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}
