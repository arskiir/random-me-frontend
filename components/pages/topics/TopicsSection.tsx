import { Icon } from "@iconify/react"
import { useAppSelector, useAppDispatch } from "hooks"
import { FormEvent, useState } from "react"
import {
  addTopic,
  removeTopic,
  selectTopic,
  setTopicName,
} from "store/slice/user"
import {
  addTopicDB,
  removeTopicDB,
  selectTopicDB,
  setTopicNameDB,
} from "utils/axios/request/database"

export default function TopicsSection() {
  const { topics, selectedTopicId } = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()

  const [addTopicText, setAddTopicText] = useState("")

  const handleTopicSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await addTopicDB(addTopicText)
    dispatch(addTopic({ name: addTopicText }))
    setAddTopicText("")
  }

  const editTopicName = async () => {
    const name = window.prompt(
      "Enter the new name",
      topics.find((t) => t._id === selectedTopicId).name
    )
    if (!name) return

    await setTopicNameDB(selectedTopicId, name)
    dispatch(setTopicName({ topicId: selectedTopicId, name }))
  }

  const deleteTopic = async () => {
    await removeTopicDB(selectedTopicId)
    dispatch(removeTopic({ topicId: selectedTopicId }))
  }

  const handleSelectTopic = async (topicId: string) => {
    await selectTopicDB(topicId)
    dispatch(selectTopic({ topicId }))
  }

  return (
    <div
      className="
      flex 
      flex-col 
      text-center
      space-y-4 xl:space-y-12"
    >
      <h1
        className="
      font-Sen font-bold"
      >
        Topics
      </h1>
      <div
        className="
      bg-cyan-600 
      rounded-lg 
      overflow-hidden 
      overflow-y-auto"
      >
        <div>
          <form
            onSubmit={handleTopicSubmit}
            className="flex w-full items-center space-x-4 px-4
                    py-3"
          >
            <input
              value={addTopicText}
              onChange={(e) => setAddTopicText(e.target.value)}
              type="text"
              required
              className="
                flex-1
                bg-transparent
                placeholder-slate-50/50
                border-0 border-b-2 border-slate-50/50
                focus:ring-transparent focus:border-slate-50
                caret-slate-50
                text-slate-100
              "
              placeholder="Add a topic"
            />
            <button type="submit">
              <Icon icon="akar-icons:plus" className="w-6 h-6 text-slate-50" />
            </button>
          </form>
        </div>
        {topics.map((topic) => (
          <div
            onClick={() => handleSelectTopic(topic._id)}
            key={topic._id}
            className={`
            w-full 
            text-left 
            text-lg 
            px-4 
            h-16 
            text-slate-50
            cursor-pointer 
            transition-colors 
            flex 
            items-center
            ${selectedTopicId === topic._id ? "bg-sky-100 text-cyan-600" : ""}`}
          >
            <span className="flex-1">
              {topic.name} ({topic.options.length})
            </span>
            {topic._id === selectedTopicId && (
              <div className="flex item-center gap-2">
                <Icon
                  onClick={() => editTopicName()}
                  className="
                  w-5 
                  h-5 
                  cursor-pointer
                hover:text-slate-800/50"
                  icon="clarity:edit-solid"
                />
                <Icon
                  onClick={() => deleteTopic()}
                  className="
                  w-5 
                  h-5 
                  cursor-pointer
                  hover:text-slate-800/50"
                  icon="fluent:delete-24-filled"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
