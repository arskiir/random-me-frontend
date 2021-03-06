import axiosServerInstance from "utils/axios/instance/server"
import { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    headers: { cookie },
    method,
  } = req

  if (method !== "GET")
    return res.status(405).json({
      message: "Method not allowed",
    })

  try {
    const { data, status } = await axiosServerInstance.get("/auth/me/", {
      headers: {
        cookie,
      },
    })
    res.status(status).json(data)
  } catch ({ response: { status, data } }) {
    res.status(status).json(data)
  }
}

export default handler
