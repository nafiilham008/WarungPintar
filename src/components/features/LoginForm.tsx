'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { loginAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Store, Loader2 } from 'lucide-react'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Masuk Dashboard'}
        </Button>
    )
}

export function LoginForm() {
    const [state, action] = useActionState(loginAction, null)

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md border-0 shadow-lg">
                <CardHeader className="text-center space-y-2 pb-6">
                    <div className="mx-auto bg-emerald-100 p-3 rounded-xl w-fit mb-2">
                        <Store className="w-8 h-8 text-emerald-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800">Login Admin</CardTitle>
                    <CardDescription>Masuk untuk mengelola Warung Ibu Pintar</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={action} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" placeholder="admin" required className="bg-slate-50 border-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" placeholder="••••••" required className="bg-slate-50 border-slate-200" />
                        </div>

                        {state?.error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center font-medium animate-in fade-in">
                                {state.error}
                            </div>
                        )}

                        <div className="pt-2">
                            <SubmitButton />
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t pt-4">
                    <p className="text-xs text-slate-400">Warung Ibu Pintar v1.0</p>
                </CardFooter>
            </Card>
        </div>
    )
}
