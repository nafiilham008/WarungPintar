'use server'

import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

const loginSchema = z.object({
    username: z.string().min(1, "Username wajib diisi"),
    password: z.string().min(1, "Password wajib diisi"),
})

export async function loginAction(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData.entries())
    const parsed = loginSchema.safeParse(data)

    if (!parsed.success) {
        return { error: "Input tidak valid" }
    }

    const { username, password } = parsed.data

    try {
        const user = await prisma.user.findUnique({
            where: { username }
        })

        if (!user) {
            return { error: "Username atau password salah" }
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
            return { error: "Username atau password salah" }
        }

        // Set Simple Session Cookie
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
        const cookieStore = await cookies()
        cookieStore.set('admin_session', 'true', {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        })

    } catch (err) {
        console.error('Login error:', err)
        return { error: "Terjadi kesalahan sistem" }
    }

    redirect('/dashboard')
}

export async function logoutAction() {
    (await cookies()).delete('admin_session')
    redirect('/login')
}
