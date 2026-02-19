import { auth } from "@/auth"
 
export async function DiscordAvatar() {
  const session = await auth()
 
  if (!session?.user) return null
 
  return (
    <div>
      <img src={session.user.image || undefined} alt="User Avatar" width="100" />
    </div>
  )
}