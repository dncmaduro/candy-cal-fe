import { getFromCookies } from "../store/cookies"
import { useUserStore } from "../store/userStore"
import { callApi } from "./axios"
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
  CheckTokenRequest,
  CheckTokenResponse,
  GetMeResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UpdateAvatarRequest,
  UpdateAvatarResponse,
  UpdateUserRequest,
  UpdateUserResponse
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

  const getMe = async () => {
    return callApi<never, GetMeResponse>({
      method: "GET",
      path: `/v1/users/me`,
      token: accessToken
    })
  }

  const changePassword = async (req: ChangePasswordRequest) => {
    return callApi<ChangePasswordRequest, ChangePasswordResponse>({
      method: "PATCH",
      path: `/v1/users/change-password`,
      data: req,
      token: accessToken
    })
  }

  const updateAvatar = async (req: UpdateAvatarRequest) => {
    return callApi<UpdateAvatarRequest, UpdateAvatarResponse>({
      method: "PATCH",
      path: `/v1/users/avatar`,
      data: req,
      token: accessToken
    })
  }

  const updateUser = async (req: UpdateUserRequest) => {
    return callApi<UpdateUserRequest, UpdateUserResponse>({
      method: "PATCH",
      path: `/v1/users/update`,
      data: req,
      token: accessToken
    })
  }

  return {
    login,
    getNewToken,
    checkToken,
    getMe,
    changePassword,
    updateAvatar,
    updateUser
  }
}
