import {
  LoginInputEmail,
  LoginInputPassword,
  LoginInputText,
} from "components/common/LoginInput"
import LoginRegisterLayout from "components/layout/LoginRegisterLayout"
import { useAppDispatch } from "hooks"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { FormEvent, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { hideLoader, showLoader } from "store/slice/app"
import { setUser } from "store/slice/user"
import { User } from "types"
import { AvailableLanguages } from "types/internationalization"
import { getLocalUser, getPageTitle, onPageMount, removeFromLocal } from "utils"
import { register, registerWithCurrentGuest } from "utils/axios/request/auth"
import { guestUserId, ROUTES } from "utils/constants"

export default function Register() {
  const { t } = useTranslation("translation", { keyPrefix: "register" })
  const router = useRouter()
  const { i18n } = useTranslation()
  const dispatch = useAppDispatch()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [currentGuest, setCurrentGuest] = useState<User>(null)
  const [withCurrentGuest, setWithCurrentGuest] = useState(true)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (username.trim() === "") {
      alert(t("emptyUsernameAlert"))
      return
    }
    if (email.trim() === "") {
      alert(t("emptyEmailAlert"))
      return
    }
    if (password.trim() === "") {
      alert(t("emptyPasswordAlert"))
      return
    }
    if (passwordConfirm.trim() === "") {
      alert(t("emptyPasswordConfirmAlert"))
      return
    }
    if (password !== passwordConfirm) {
      alert(t("passwordConfirmAlert"))
      return
    }

    dispatch(showLoader())
    try {
      if (withCurrentGuest && currentGuest) {
        const { language, selectedTopicId, topics } = currentGuest
        const {
          data: { _id },
        } = await registerWithCurrentGuest(
          username,
          email,
          password,
          passwordConfirm,
          language,
          selectedTopicId,
          topics
        )
        dispatch(
          setUser({ _id, username, language, selectedTopicId, topics, email })
        )
        removeFromLocal("user")
      } else {
        const { data: user } = await register(
          email,
          username,
          password,
          passwordConfirm,
          i18n.language as AvailableLanguages
        )
        dispatch(setUser(user))
      }

      await router.replace(ROUTES.home)
    } catch (err) {
      alert(err.response.data.message)
    }
    dispatch(hideLoader())
  }

  useEffect(() => {
    onPageMount()

    const user = getLocalUser()
    if (user && user._id === guestUserId) {
      setCurrentGuest(user)
    }
  }, [])

  return (
    <>
      <Head>
        <title>{getPageTitle("register.title")}</title>
        <meta name="description" content={t("description")} />
        <meta property="og:title" content={getPageTitle("register.title")} />
        <meta property="og:description" content={t("description")} />
      </Head>

      <LoginRegisterLayout topic={t("title")}>
        <form autoComplete="off" className="space-y-4" onSubmit={handleSubmit}>
          <LoginInputText
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            placeholder={t("usernameExamplePlaceholder")}
          />
          <LoginInputEmail
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder={t("emailExamplePlaceholder")}
          />
          <LoginInputPassword
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder={t("passwordExamplePlaceholder")}
          />
          <LoginInputPassword
            onChange={(e) => setPasswordConfirm(e.target.value)}
            value={passwordConfirm}
            placeholder={t("passwordConfirmExamplePlaceholder")}
          />

          <div className="space-y-1">
            <button
              type="submit"
              className="
            login-register-button
            uppercase
            "
            >
              {t("title")}
            </button>
            <div className="flex justify-between">
              <Link href={ROUTES.login}>
                <a className="clickable-text-cyan text-sm">{t("login")}</a>
              </Link>
              {currentGuest !== null && (
                <label
                  className="
              space-x-1
              cursor-pointer
              "
                  htmlFor="withCurrentGuest"
                >
                  <input
                    checked={withCurrentGuest}
                    onChange={() => setWithCurrentGuest(!withCurrentGuest)}
                    id="withCurrentGuest"
                    className="
                my-checkbox
              cursor-pointer
              "
                    type="checkbox"
                  />
                  <span
                    className="
                text-sm
                font-semibold
                dark:text-slate-200
                "
                  >
                    {t("withCurrentGuest")}
                  </span>
                </label>
              )}
            </div>
          </div>
        </form>
      </LoginRegisterLayout>
    </>
  )
}
