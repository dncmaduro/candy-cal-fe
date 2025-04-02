import { callApi } from "./axios"
import { LoginRequest, LoginResponse } from "./models"

export const useUsers = () => {
  const login = async (req: LoginRequest) => {
    return callApi<LoginRequest, LoginResponse>({
      method: "POST",
      path: `/v1/users/login`,
      data: req
    })
  }

  return { login }
}
