import NextAuth, { type DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { env } from "@/env"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: Role
        } & DefaultSession["user"]
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id
                session.user.role = (user as any).role
            }
            return session
        },
    },
    events: {
        async createUser({ user }) {
            if (user.email && env.ADMIN_EMAILS.includes(user.email.toLowerCase())) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { role: "ADMIN" },
                })
            }
        },
    },
})
