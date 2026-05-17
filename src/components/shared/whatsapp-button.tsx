"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"

const WHATSAPP_NUMBER = "5515996279639"
const DEFAULT_MESSAGE = "Olá! Preciso de ajuda com o sistema Lição de Casa. 📚"

const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`

export function WhatsAppButton() {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Suporte via WhatsApp"
      className="
        fixed bottom-6 right-6 z-50
        flex items-center gap-2.5
        p-3.5 md:pl-4 md:pr-5 md:py-3 rounded-full
        bg-[#25D366] text-white shadow-lg
        hover:bg-[#1ebe5d] hover:scale-105
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2
      "
    >
      <MessageCircle className="w-6 h-6 md:w-5 md:h-5 fill-white stroke-none shrink-0" />
      <span className="hidden md:block text-sm font-semibold leading-tight">
        Preciso de ajuda
      </span>
    </Link>
  )
}
