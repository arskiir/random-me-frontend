import axiosClientInstance from "../instance/client"

export const checkMe = () => {
  interface ResponseData {}
  return axiosClientInstance.get<ResponseData>("/auth/me")
}

export const login = (email: string, password: string) => {
  interface ResponseData {}
  return axiosClientInstance.post<ResponseData>("/auth/login", {
    email,
    password,
  })
}

export const logout = () => {
  interface ResponseData {}
  return axiosClientInstance.post<ResponseData>("/auth/logout")
}

export const register = (
  email: string,
  username: string,
  password: string,
  confirmPassword: string
) => {
  interface ResponseData {}
  return axiosClientInstance.post<ResponseData>("/auth/register", {
    email,
    username,
    password,
    confirmPassword,
  })
}

// /**
//  * @param by Tell the server to search by email or username
//  * @param text Email if by is 'email' else username
//  */
// export const forgotPassword = (by: "email" | "username", text: string) => {
//   interface ResponseData {}
//   return axiosClientInstance.post<ResponseData>(
//     `/auth/forgot-password?by=${by}`,
//     {
//       text,
//     }
//   )
// }

// export const resetPassword = (password: string) => {
//   interface ResponseData {}
//   return axiosClientInstance.post<ResponseData>("/auth/reset-password", {
//     password,
//   })
// }