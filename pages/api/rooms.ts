import { getPublicRooms } from "../../lib/cache"
import { NextApiRequest, NextApiResponse } from "next"

export default async function rooms(_: NextApiRequest, res: NextApiResponse) {
  const publicRooms = await getPublicRooms()
  
  // Return simplified room info for the lobby
  const roomList = publicRooms.map(room => ({
    id: room.id,
    ownerName: room.ownerName || "Unknown",
    memberCount: room.users.length,
  }))
  
  res.json({ rooms: roomList })
}
