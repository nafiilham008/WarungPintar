'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, Loader2, StopCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface VoiceMicrophoneProps {
    onCommand: (cmd: any) => void
    className?: string
}

export function VoiceMicrophone({ onCommand, className }: VoiceMicrophoneProps) {
    const [isListening, setIsListening] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [transcript, setTranscript] = useState('')
    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = false
            recognitionRef.current.lang = 'id-ID'
            recognitionRef.current.interimResults = true

            recognitionRef.current.onresult = (event: any) => {
                const current = event.resultIndex
                const transcriptText = event.results[current][0].transcript
                setTranscript(transcriptText)
            }

            recognitionRef.current.onend = () => {
                setIsListening(false)
            }

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error)
                setIsListening(false)
                toast.error("Gagal menangkap suara: " + event.error)
            }
        } else {
            toast.error("Browser tidak support fitur suara.")
        }
    }, [])

    // Trigger processing when listening stops and we have text
    useEffect(() => {
        if (!isListening && transcript) {
            processCommand(transcript)
        }
    }, [isListening, transcript])

    const startListening = () => {
        setTranscript('')
        setIsListening(true)
        try {
            recognitionRef.current?.start()
        } catch (e) {
            console.error("Start mic failed:", e)
        }
    }

    const stopListening = () => {
        recognitionRef.current?.stop()
        setIsListening(false)
    }

    const processCommand = async (text: string) => {
        if (!text.trim()) return

        setIsProcessing(true)

        try {
            const res = await fetch('/api/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            })

            if (!res.ok) {
                const errText = await res.text()
                // Safely log error for dev but generic for user
                console.error("API Error:", res.status, errText)
                throw new Error(`API Error: ${res.status}`)
            }

            const data = await res.json()

            if (data.reply) {
                toast.success("Ibu Pintar:", {
                    description: data.reply
                })
            }

            onCommand(data)
        } catch (err: any) {
            console.error("Process Command Failed:", err)
            // Just general error, don't show stack trace to user
            toast.error("Maaf, Ibu kurang mendengar dengan jelas.")
        } finally {
            setIsProcessing(false)
            setTranscript('') // Clear after process
        }
    }

    return (
        <div className={cn("fixed bottom-24 right-4 z-40 transition-all duration-300", className)}>
            {isListening && (
                <div className="absolute -inset-4 bg-emerald-500/20 rounded-full animate-ping pointer-events-none" />
            )}

            <Button
                size="icon"
                className={cn(
                    "w-14 h-14 rounded-full shadow-xl transition-all duration-300 border-4",
                    isListening ? "bg-red-500 hover:bg-red-600 border-red-200" : "bg-emerald-600 hover:bg-emerald-700 border-white",
                    isProcessing ? "animate-pulse" : ""
                )}
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
            >
                {isProcessing ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : isListening ? (
                    <StopCircle className="w-6 h-6 text-white animate-pulse" />
                ) : (
                    <Mic className="w-6 h-6 text-white" />
                )}
            </Button>

            {/* Live Transcript Bubble */}
            {isListening && transcript && (
                <div className="absolute bottom-full right-0 mb-4 bg-white px-4 py-2 rounded-xl rounded-br-none shadow-lg border border-slate-100 whitespace-nowrap max-w-[80vw] overflow-hidden text-ellipsis">
                    <p className="text-slate-600 font-medium">"{transcript}..."</p>
                </div>
            )}
        </div>
    )
}
