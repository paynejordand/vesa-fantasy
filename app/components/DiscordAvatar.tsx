import Image from "next/image"
import { getUser } from "@/app/lib/dal"
 
export async function DiscordAvatar() {
  const session = await getUser()
 
  if (!session) return null
  return (
      <Image src={session.image || ""} alt="User Avatar" width={40} height={40} />
  )
}