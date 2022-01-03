import { useAppDispatch, useAppSelector } from "hooks"
import { fallbackLng } from "locales"
import { useRouter } from "next/router"
import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { setUser } from "store/slice/user"
import { getLocalUser, saveToLocal } from "utils"
import { checkMe } from "utils/axios/request/auth"
import { anonymousUserId } from "utils/constants"

interface AuthProviderProps {
  children: React.ReactNode
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const { i18n } = useTranslation()
  const user = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()
  const router = useRouter()

  const firstLoad = useRef(true)

  useEffect(() => {
    // user on the first load is set to default user initially
    if (firstLoad.current) {
      firstLoad.current = false
      return
    }
    if (!user) return

    i18n.changeLanguage(user.lang ?? fallbackLng)

    if (user._id === anonymousUserId) {
      saveToLocal("user", user)
    }
  }, [i18n, user])

  useEffect(() => {
    const onMount = async () => {
      const userDB = await checkMe()
      if (userDB) {
        dispatch(setUser(userDB))
        router.replace("/")
        return
      }
      const localUser = getLocalUser()
      if (!localUser) {
        if (router.pathname === "/register") return
        router.replace("/login")
        return
      }
    }
    onMount()
  }, [])

  return <div>{children}</div>
}

export default AuthProvider
