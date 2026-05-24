import { Card, CardContent } from "@/components/ui/card"
import { ClipboardList, CheckCircle2, TrendingDown } from "lucide-react"

interface RequestsStatsProps {
  pending:          number
  approvedThisWeek: number
  rejectedThisWeek: number
}

export function RequestsStats({ pending, approvedThisWeek, rejectedThisWeek }: RequestsStatsProps) {
  const total = approvedThisWeek + rejectedThisWeek
  const rejectionRate = total > 0 ? Math.round((rejectedThisWeek / total) * 100) : 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <ClipboardList className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pending}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{approvedThisWeek}</p>
              <p className="text-xs text-muted-foreground">Aprovadas esta semana</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2 sm:col-span-1">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rejectedThisWeek}</p>
              <p className="text-xs text-muted-foreground">
                Recusadas{rejectionRate > 0 ? ` (${rejectionRate}%)` : " esta semana"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
