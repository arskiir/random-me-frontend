import { Logo } from "./../components/common/Logo"
import { changeLanguage, setUser } from "store/slice/user"
import { LocalStorageKey, Topic, User } from "types"
import { Arm } from "./MAB/Arm"
import store from "store"
import { BanditArm, ProbabilityOfEveryArm, RandomPolicy } from "types/mab"
import { getProbabilityOfEveryArm } from "./MAB"
import { fallbackLng } from "locales"
import { t as translate } from "i18next"
import {
  guestUserId,
  languageOpposites,
  maxLengthTopicAndOptionText,
  nullUserId,
  ROUTES,
} from "./constants"
import { pullDB } from "./axios/request/database"
import {
  setLoaderBefore,
  showLoader,
  unsetLoaderBefore,
  hideLoader,
  setCheckedMe,
} from "store/slice/app"
import router from "next/router"
import { checkMe } from "./axios/request/auth"

export const saveToLocal = (key: LocalStorageKey, data: any) => {
  if (typeof data === "object") {
    data = JSON.stringify(data)
  }
  localStorage.setItem(key, data)
}

export const getFromLocal = <T>(key: LocalStorageKey): T | null => {
  return JSON.parse(localStorage.getItem(key))
}

export const passedTextLimit = (
  text: string,
  limit = maxLengthTopicAndOptionText
): boolean => {
  return text.length <= limit
}

export const removeFromLocal = (key: LocalStorageKey) => {
  localStorage.removeItem(key)
}

export const getLocalUser = () => {
  return getFromLocal<User>("user")
}

const createLocalUser = (_id: string): User => {
  const user: User = {
    _id,
    username: _id,
    selectedTopicId: null,
    topics: [],
    language: fallbackLng,
    email: null,
  }
  return user
}

export const createNullUser = () => {
  return createLocalUser(nullUserId)
}

export const createGuestUser = () => {
  return createLocalUser(guestUserId)
}

export const uuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const createOption = (
  _id: string,
  name: string,
  bias: number
): BanditArm => {
  return {
    _id,
    name,
    pulls: 0,
    reward: 0,
    bias,
  }
}

/**
 * Change language in the user store
 * @returns The language to change to
 */
export const switchLanguage = () => {
  const languageToChangeTo = languageOpposites[store.getState().user.language]
  store.dispatch(
    changeLanguage({
      language: languageToChangeTo,
    })
  )
  return languageToChangeTo
}

export const decodePolicy = (policy: RandomPolicy) => {
  switch (policy) {
    case RandomPolicy.EQUAL_WEIGHT:
      return "Equal Weight"
    case RandomPolicy.RANDOMIZE:
      return "Randomize"
    case RandomPolicy.EPSILON_GREEDY:
      return "Epsilon Greedy"
    case RandomPolicy.SOFTMAX:
      return "Softmax"
    case RandomPolicy.UCB:
      return "UCB1"
    case RandomPolicy.MULTINOMIAL:
      return "Multinomial"
    default:
      throw new Error(`Unknown policy: ${policy}`)
  }
}

const choice = <T>(array: T[], probabilities: number[]) => {
  const rand = Math.random()
  let sum = 0
  for (let i = 0; i < array.length; i++) {
    sum += probabilities[i]
    if (sum >= rand) {
      return array[i]
    }
  }
  throw new Error("Should not reach here")
}

const getArmsWithProbabilities = (): {
  arms: Arm[]
  probabilityOfEveryArm: ProbabilityOfEveryArm
  policy: RandomPolicy
} => {
  const {
    user: { selectedTopicId, topics },
  } = store.getState()

  const selectedTopic = topics.find((topic) => topic._id === selectedTopicId)
  if (!selectedTopic) {
    return {
      arms: [] as Arm[],
      probabilityOfEveryArm: [] as ProbabilityOfEveryArm,
      policy: RandomPolicy.RANDOMIZE,
    }
  }

  const { options, t, policy } = selectedTopic
  const arms = options.map((arm) => new Arm(arm))
  const states = arms.map((arm) => arm.state())

  const probabilityOfEveryArm = getProbabilityOfEveryArm(
    policy,
    states,
    t,
    arms
  )
  return { arms, probabilityOfEveryArm, policy }
}

export const getProbabilities = () => {
  const { arms, probabilityOfEveryArm, policy } = getArmsWithProbabilities()
  return {
    armsWithProbability: arms
      .map((a, index) => ({
        arm: a,
        probability: probabilityOfEveryArm[index],
      }))
      .sort((a, b) => b.probability - a.probability),
    policyName: decodePolicy(policy),
  }
}

export const randomMe = async () => {
  const {
    user: { selectedTopicId },
  } = store.getState()
  const { arms, probabilityOfEveryArm } = getArmsWithProbabilities()
  const selectedArm = choice(arms, probabilityOfEveryArm)
  const reward = Number(
    confirm(translate("utils.randomConfirm", { option: selectedArm.name }))
  ) as 0 | 1
  selectedArm.pull(reward)
  loggedInUserDo(
    async () => await pullDB(selectedTopicId, selectedArm._id, reward)
  )
}

export const createDefaultTopic = (_id: string, name: string): Topic => {
  return {
    _id,
    name,
    options: [],
    policy: RandomPolicy.MULTINOMIAL,
    t: 0,
  }
}

export const loggedInUserDo = async (callback: Function = () => {}) => {
  const { _id } = store.getState().user
  if (_id !== guestUserId && _id !== nullUserId) {
    await callback()
  }
}

export const setTheme = () => {
  if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark")
    ;(document.getElementById("favicon") as HTMLLinkElement).href =
      "/favicon-dark.png"
  } else {
    document.documentElement.classList.remove("dark")
    ;(document.getElementById("favicon") as HTMLLinkElement).href =
      "/favicon.png"
  }
}

export const goDark = () => {
  saveToLocal("theme", "dark")
  setTheme()
}

export const goLight = () => {
  saveToLocal("theme", "light")
  setTheme()
}

export const removeTheme = () => {
  removeFromLocal("theme")
  setTheme()
}

const showCheckMeLoader = () => {
  store.dispatch(setLoaderBefore(Logo))
  store.dispatch(showLoader())
}

const hideCheckMeLoader = () => {
  store.dispatch(unsetLoaderBefore())
  store.dispatch(hideLoader())
}

export const onPageMount = async () => {
  if (store.getState().app.checkedMe) {
    return
  }

  const { pathname } = router

  if (pathname === ROUTES.resetPassword) {
    // the store here currently stores null user but
    // this is safe to do because there's only a <Link> back to login
    // and clicking on _continue as guest_ will load the guest to store
    // or clicking login is obviously safe
    store.dispatch(setCheckedMe())
    return
  }

  showCheckMeLoader()
  const {
    data: userDB,
  }: {
    data: User | null
  } = await checkMe().catch(() => ({
    data: null,
  }))
  store.dispatch(setCheckedMe())

  if (userDB) {
    store.dispatch(setUser(userDB))
    if (
      [ROUTES.login, ROUTES.register, ROUTES.forgotPassword].includes(pathname)
    ) {
      await router.replace(ROUTES.home)
    }
    hideCheckMeLoader()
    return
  }

  const localUser = getLocalUser()

  if (!localUser) {
    if (pathname === ROUTES.register) {
      hideCheckMeLoader()
      return
    }
    await router.replace(ROUTES.login)
    hideCheckMeLoader()
    return
  }

  // anonymous user is saved
  store.dispatch(setUser(localUser))
  hideCheckMeLoader()
}

export const getPageTitle = (i18nKey: string) => {
  return `${translate(i18nKey)} | Random Me`
}
