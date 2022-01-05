import { LocalStorageKey, Topic, User } from "types"
import { Arm } from "./MAB/Arm"
import store from "store"
import { BanditArm, ProbabilityOfEveryArm, RandomPolicy } from "types/mab"
import { getProbabilityOfEveryArm } from "./MAB"
import i18n, { fallbackLng } from "locales"
import { t as translate } from "i18next"
import { guestUserId, nullUserId } from "./constants"
import { pullDB } from "./axios/request/database"

export const saveToLocal = (key: LocalStorageKey, data: any) => {
  if (typeof data === "object") {
    data = JSON.stringify(data)
  }
  localStorage.setItem(key, data)
}

export const getFromLocal = <T>(key: LocalStorageKey): T | null => {
  return JSON.parse(localStorage.getItem(key))
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

export const switchLanguage = () => {
  i18n.changeLanguage(
    {
      en: "th",
      th: "en",
    }[i18n.language]
  )
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
  if (_id !== guestUserId) {
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
