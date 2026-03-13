import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.username = profile.username;
        token.discordId = profile.id;
        console.log("Profile and token in JWT callback:");
        console.log(profile);
        console.log(token);
      }
      return token;
    },
    async session({ session, token }) {
      session.user.name = token.username as string;
      session.user.id = token.discordId as string;
      return session;
    },
  },
});
