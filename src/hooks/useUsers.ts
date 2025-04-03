import { getFromCookies } from "../store/cookies"
import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"
import {
  CheckTokenRequest,
  CheckTokenResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse
} from "./models"

export const useUsers = () => {
  const refreshToken = getFromCookies("refreshToken")
  const { accessToken } = useUserStore()

  const login = async (req: LoginRequest) => {
    return callApi<LoginRequest, LoginResponse>({
      method: "POST",
      path: `/v1/users/login`,
      data: req
    })
  }

  const getNewToken = async () => {
    return callApi<RefreshTokenRequest, RefreshTokenResponse>({
      method: "POST",
      path: `/v1/users/refresh-token`,
      data: { refreshToken }
    })
  }

  const checkToken = async () => {
    return callApi<CheckTokenRequest, CheckTokenResponse>({
      method: "POST",
      path: `/v1/users/check-token`,
      data: { accessToken }
    })
  }

  return { login, getNewToken, checkToken }
}
