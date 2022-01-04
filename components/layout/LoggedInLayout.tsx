import Sidebar from "components/common/Sidebar"
import MobileSidebar from "components/common/MobileSidebar"
import LanguageSwitch from "components/common/LanguageSwitch"
import { useTranslation } from "react-i18next"
// import { useAppSelector } from "hooks"
// import { useEffect } from "react"
// import { useRouter } from "next/router"

interface LoggedInLayoutProps {
  children?: React.ReactNode
}

export default function LoggedInLayout({ children }: LoggedInLayoutProps) {
  const { t } = useTranslation()
  // const user = useAppSelector((state) => state.user)
  // const router = useRouter()

  const routeMap = {
    "/": t("home.title"),
    "/topics": t("topics.title"),
    "/account": t("account.title"),
    "/random-policies": t("policies.title"),
  }
  const menuText = t("utils.menuText")

  // useEffect(() => {
  //   console.log("hi")
  //   if (!user) router.replace("/login")
  // }, [])

  return (
    <div
      className="
    flex
    flex-col lg:flex-row
    h-screen"
    >
      <div
        className="
        hidden lg:flex 
        justify-center 
        w-[14rem] 
        pt-[2rem]
    "
      >
        <Sidebar menuText={menuText} routeMap={routeMap} />
      </div>
      <div
        className="
        lg:hidden flex 
        z-10
        h-[5rem]"
      >
        <MobileSidebar menuText={menuText} routeMap={routeMap} />
      </div>
      <div className="flex-1">{children}</div>
      <div
        className="
        w-[14rem]
        h-[5rem]
        "
      >
        <div
          className="
        lg:flex
        justify-center
        pt-[2rem]
        "
        >
          <LanguageSwitch />
        </div>
      </div>
    </div>
  )
}
