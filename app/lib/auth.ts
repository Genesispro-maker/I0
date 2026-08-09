import { AuthOptions, SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github";
import prisma from "./prisma";
import bcrypt from "bcryptjs"

export const authOptions : AuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
            profile(profile){
                return {
                    id: profile.id.toString(),
                    name: profile.name ?? profile.login,
                    email: profile.email,
                    image: profile.avatar_url,
                    username: profile.login,
                }
            }
        }),

        CredentialsProvider({
            name: "Email",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                },
                password: {
                    label: "Password",
                    type: "password",
                },
            },

            async authorize(credentials){
                if(!credentials?.email || !credentials.password){
                    return null
                }

                const user = await prisma.user.findUnique({
                        where: {
                            email: credentials?.email,
                        }
                })

                if(!user){
                    return null
                }

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
                
                if(!isValid){
                    return null
                }

                return {
                    id: user.id,
                    name: user.username,
                    email: user.email,
                }
            }
        })
    ],

    session: {
        strategy: "jwt" as SessionStrategy
    },

    callbacks: {
        async signIn({user, account}){
            if(account?.provider === "github"){
                try{
                    const existinguser = await prisma.user.findUnique({
                        where: {
                            email: user.email!,
                        }
                    });

                    if(!existinguser){
                        const newuser = await prisma.user.create({
                            data: {
                                email: user.email!,
                                username: user.name!,
                                passwordHash: "",
                                image: user.image,
                            }
                        })

                        user.id = newuser.id
                    }else{
                        user.id = existinguser.id
                    }
                }catch(err){
                    if(err instanceof Error){
                        return false
                    }
                }
            }
            return true
        },

        async jwt({token, user}){
            if(user){
                token.id = user.id
                token.name = user.name
            }

            if(token.id){
                const existinguser = await prisma.user.findUnique({
                    where: {
                        id: token.id as string,
                    },
                    select:{
                        id: true,
                    },
                });

                if(!existinguser){
                    return {}
                }
            }

            return token
        },

         async session({ session, token }) {
           if (session.user){
             session.user.id = token.id as string
             session.user.name = token.name as string
           }
           
           return session
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "production",
}

