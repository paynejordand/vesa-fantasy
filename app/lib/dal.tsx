import "server-only";

import { auth } from "@/auth";
import { cache } from "react";
import { SessionUser } from "@/app/db/definitions";
import { getAdminByUsername } from "@/app/db/data";
import { Session } from "next-auth";

export const verifySession = cache(async (): Promise<Session | null> => {
  const session = await auth();
  return session;
});

export const getUser = cache(async (): Promise<SessionUser | null> => {
  const session = await verifySession();
  console.log("Session in getUser:");
  console.log(session);
  if (!session) return null;

  const isAdmin = await getAdminByUsername(session.user!.name!);
  const role = isAdmin ? "Admin" : "User";
  return {
    name: session.user!.name!,
    image: session.user!.image!,
    role: role,
    id: session.user!.id!,
  };
});
