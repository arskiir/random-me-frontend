import { LoginInputEmail } from "components/common/LoginInput"
import LoginRegisterLayout from "components/layout/LoginRegisterLayout"
import { useAppDispatch } from "hooks"
import Head from "next/head"
import Link from "next/link"
import { FormEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { hideLoader, showLoader } from "store/slice/app"
import { forgotPassword } from "utils/axios/request/auth"

const ForgotPassword = () => {
  const { t } = useTranslation("translation", { keyPrefix: "forgotPassword" })
  const dispatch = useAppDispatch()

  const [email, setEmail] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (email.trim() === "") {
      alert(t("emptyEmailAlert"))
      return
    }

    dispatch(showLoader())
    let error = false
    await forgotPassword(email).catch((err) => {
      alert(err)
      error = true
    })
    dispatch(hideLoader())
    if (error) {
      return
    }
    setEmail("")
    alert(t("successAlert"))
  }

  return (
    <>
      <Head>
        <title>{t("title")} | Random Me</title>
        <meta name="description" content={t("description")} />
        <meta property="og:title" content={t("title")} />
        <meta property="og:description" content={t("description")} />
      </Head>

      <LoginRegisterLayout topic="Login">
        <form onSubmit={handleSubmit}>
          <LoginInputEmail
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("email")}
          />
          <button
            type="submit"
            className="
            login-register-button
            uppercase
            "
          >
            {t("send")}
          </button>
        </form>
        <Link href="/login">
          <a className="clickable-text-cyan text-sm">{t("login")}</a>
        </Link>
      </LoginRegisterLayout>
    </>
  )
}

export default ForgotPassword