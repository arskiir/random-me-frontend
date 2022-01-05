import { AppProps } from "next/app"
import "../styles/globals.css"
import store from "store"
import { Provider } from "react-redux"
import "locales"
import AuthProvider from "providers/AuthProvider"
import LoaderLayout from "components/layout/LoaderLayout"
import { useEffect } from "react"
import { setTheme } from "utils"
import Head from "next/head"

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    setTheme()
  }, [])

  return (
    <Provider store={store}>
      <Head>
        <link rel="shortcut icon" id="favicon" href="/favicon.png" />
      </Head>
      <LoaderLayout>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </LoaderLayout>
    </Provider>
  )
}

export default MyApp
