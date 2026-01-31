'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { BrainCircuit, Save } from 'lucide-react'
import { saveSettings, getSettings } from '@/actions/settings'

export default function SettingsPage() {
    const [apiKey, setApiKey] = useState('')
    const [model, setModel] = useState('gemini-2.0-flash')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Load existing settings
        getSettings().then(config => {
            if (config.GEMINI_API_KEY) setApiKey(config.GEMINI_API_KEY)
            if (config.GEMINI_MODEL) setModel(config.GEMINI_MODEL)
        })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData()
        formData.append('gemini_api_key', apiKey)
        formData.append('gemini_model', model)

        const res = await saveSettings(formData)

        if (res.success) {
            toast.success(res.message)
        } else {
            toast.error(res.message)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800">Pengaturan Sistem</h2>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BrainCircuit className="w-5 h-5 text-emerald-600" />
                            Konfigurasi AI (Gemini)
                        </CardTitle>
                        <CardDescription>
                            Atur kunci API dan model kecerdasan buatan untuk si "Ibu Pintar".
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="api_key">Gemini API Key</Label>
                                <Input
                                    id="api_key"
                                    type="password"
                                    placeholder="AIzaSy..."
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="font-mono"
                                />
                                <p className="text-[10px] text-slate-500">
                                    Dapatkan key di <a href="https://aistudio.google.com/" target="_blank" className="text-emerald-600 hover:underline">Google AI Studio</a>.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="model">Model AI</Label>
                                <Select value={model} onValueChange={setModel}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash (Terbaru, Cepat)</SelectItem>
                                        <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (Stabil, Hemat Kuota)</SelectItem>
                                        <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (Lebih Pintar, Lebih Lambat)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-slate-500">
                                    Gunakan <strong>1.5 Flash</strong> jika sering kena limit.
                                </p>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    {loading ? 'Menyimpan...' : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Simpan Pengaturan
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
