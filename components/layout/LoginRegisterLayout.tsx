import Glass from "components/common/Glass"
import PageBackground from "components/common/PageBackground"
import ScreenCenterLayout from "components/layout/ScreenCenterLayout"

interface LoginRegisterLayoutProps {
  topic: "Login" | "Register"
  children: React.ReactNode
}

export default function LoginRegisterLayout({
  children,
  topic,
}: LoginRegisterLayoutProps) {
  return (
    <PageBackground src="/images/bg-login-register.svg">
      <ScreenCenterLayout>
        <h1 className="sr-only">{topic}</h1>
        <main>
          <Glass
            className="
          p-[2rem] xs:p-10 sm:p-14
          space-y-4 md:space-y-10
          "
          >
            <strong
              className="
              text-slate-700
              text-4xl
              sm:text-5xl
              font-extrabold
              font-Sen
              flex
              justify-center
              "
            >
              Random Me.
            </strong>
            {children}
          </Glass>
        </main>
      </ScreenCenterLayout>
    </PageBackground>
  )
}
