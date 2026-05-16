import { DigitalizacaoPage } from "@/components/digitalizar/digitalizacao-page"
import { ScanLine }           from "lucide-react"

export default function ColaboradorDigitalizarPage() {
  return (
    <div>
      <div className="bg-brand-orange -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 px-4 sm:px-6 pt-6 pb-8 mb-6 rounded-b-2xl">
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading text-2xl">DIGITALIZAR FICHA</h1>
            <p className="text-white/80 text-sm mt-0.5">
              Fotografe ou envie a ficha do aluno para preencher o cadastro automaticamente
            </p>
          </div>
        </div>
      </div>

      <DigitalizacaoPage />
    </div>
  )
}
