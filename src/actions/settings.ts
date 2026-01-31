'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function getSettings() {
    const settings = await prisma.systemSetting.findMany()
    // Convert array to object for easier access
    const config: Record<string, string> = {}
    settings.forEach(s => {
        config[s.key] = s.value
    })
    return config
}

export async function saveSettings(formData: FormData) {
    const apiKey = formData.get('gemini_api_key') as string
    const model = formData.get('gemini_model') as string

    try {
        if (apiKey) {
            await prisma.systemSetting.upsert({
                where: { key: 'GEMINI_API_KEY' },
                update: { value: apiKey },
                create: { key: 'GEMINI_API_KEY', value: apiKey }
            })
        }

        if (model) {
            await prisma.systemSetting.upsert({
                where: { key: 'GEMINI_MODEL' },
                update: { value: model },
                create: { key: 'GEMINI_MODEL', value: model }
            })
        }

        revalidatePath('/dashboard/settings')
        return { success: true, message: 'Pengaturan berhasil disimpan!' }
    } catch (error) {
        console.error("Save settings error:", error)
        return { success: false, message: 'Gagal menyimpan pengaturan.' }
    }
}
