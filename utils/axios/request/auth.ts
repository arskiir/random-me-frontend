import i18n from "locales"
import { AvailableLanguages } from "types/internationalization"
import { Topic, User } from "types"
import axiosClientInstance from "../instance/client"

export const checkMe = () => {
  type ResponseData = User
  return axiosClientInstance.get<ResponseData>("auth/me")
}

export interface LoginPayload {
  username: string
  password: string
  language: AvailableLanguages
}
export const login = (username: string, password: string) => {
  type ResponseData = User
  const payload: LoginPayload = {
    username,
    password,
    language: i18n.language as AvailableLanguages,
  }
  return axiosClientInstance.post<ResponseData>("auth/login", payload)
}

export const logout = () => {
  interface ResponseData {}
  return axiosClientInstance.post<ResponseData>("auth/logout")
}

export const register = async (
  email: string,
  username: string,
  password: string,
  confirmPassword: string,
  language: AvailableLanguages
) => {
  type ResponseData = User
  return axiosClientInstance.post<ResponseData>("auth/register", {
    email,
    username,
    password,
    confirmPassword,
    language,
  })
}

/**
 * Register a new user with existing guest information
 * @returns The new user id
 */
export const registerWithCurrentGuest = (
  username: string,
  email: string,
  password: string,
  confirmPassword: string,
  language: AvailableLanguages,
  selectedTopicId: string,
  topics: Topic[]
) => {
  type ResponseData = { _id: string }
  return axiosClientInstance.post<ResponseData>("auth/register/guest", {
    username,
    email,
    password,
    confirmPassword,
    language,
    selectedTopicId,
    topics,
  })
}

export interface ForgotPasswordPayload {
  email: string
  language: string
}
export const forgotPassword = (email: string) => {
  interface ResponseData {
    message: string
  }
  const payload: ForgotPasswordPayload = {
    email,
    language: i18n.language as AvailableLanguages,
  }
  return axiosClientInstance.post<ResponseData>(
    `/accounts/forgot-password`,
    payload
  )
}

export interface ResetPasswordBody {
  token: string
  newPassword: string
  language: AvailableLanguages
}
export const resetPassword = ({
  token,
  language,
  newPassword,
}: ResetPasswordBody) => {
  interface ResponseData {
    message: string
  }
  const payload: ResetPasswordBody = {
    token,
    newPassword,
    language,
  }
  return axiosClientInstance.post<ResponseData>(
    "/accounts/reset-password",
    payload
  )
}
