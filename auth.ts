import NextAuth, { type DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

// Robust Credential Loading
const clientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET

// Runtime Verification (Logs to Server Console)
if (!clientId || !clientSecret) {
    console.error("❌ [Auth] Google Credentials MISSING")
} else {
    console.log(`✅ [Auth] Google Client ID loaded: ${clientId.substring(0, 20)}...`)
    console.log(`✅ [Auth] Google Client Secret loaded (len): ${clientSecret.length}`)
}

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
            clientId,
            clientSecret,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id
                // user is the database user object when using 'database' strategy
                session.user.role = (user as any).role
            }
            return session
        },
    },
    events: {
        async createUser({ user }) {
            const adminEmails = process.env.ADMIN_EMAILS?.split(",") || []
            if (user.email && adminEmails.includes(user.email)) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { role: "ADMIN" },
                })
            }
        },
    },
})
