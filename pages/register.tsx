import {
  LoginInputEmail,
  LoginInputPassword,
  LoginInputText,
} from "components/common/LoginInput"
import LoginRegisterLayout from "components/layout/LoginRegisterLayout"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { FormEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { register } from "utils/axios/request/auth"

export default function Register() {
  const { t } = useTranslation("translation", { keyPrefix: "register" })
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")

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

    await register(email, username, password, passwordConfirm)
    router.replace("/")
  }

  return (
    <>
      <Head>
        <title>{t("title")} | Random Me</title>
        <meta name="description" content={t("description")} />
      </Head>

      <LoginRegisterLayout topic="Register">
        <form className="space-y-4" onSubmit={handleSubmit}>
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
              <Link href="/login">
                <a className="clickable-text-cyan text-sm">{t("login")}</a>
              </Link>
              <label
                className="
              space-x-1
              "
                htmlFor="withCurrentGuest"
              >
                <input
                  id="withCurrentGuest"
                  className="
                my-checkbox
                "
                  type="checkbox"
                />
                <span
                  className="
                text-sm
                font-semibold
                "
                >
                  {t("withCurrentGuest")}
                </span>
              </label>
            </div>
          </div>
        </form>
      </LoginRegisterLayout>
    </>
  )
}
