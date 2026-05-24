import { headers }      from "next/headers"
import { auth }         from "@/lib/auth"
import { prisma }       from "@/lib/prisma"
import { PageHeader }   from "@/components/shared/page-header"
import { generateCalendarToken } from "@/lib/calendar-token"
import { TeacherAgendaView }    from "@/components/professor/teacher-agenda-view"

export default async function ProfessorAgendaPage() {
  const session = await auth()

  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session?.user?.email ?? "" } },
  })

  const lessons = await (teacher ? prisma.lesson.findMany({
    where:   { teacherId: teacher.id },
    include: { participants: { include: { student: { include: { user: true } } } }, subject: true },
    orderBy: { scheduledAt: "asc" },
    take:    60,
  }) : Promise.resolve([]))

  // Serialise lessons for client component (Date → ISO string)
  const serialisedLessons = lessons.map((l) => ({
    id:          l.id,
    scheduledAt: l.scheduledAt.toISOString(),
    duration:    l.duration,
    status:      l.status as string,
    modality:    l.modality as string,
    meetingLink: l.meetingLink ?? null,
    location:    l.location   ?? null,
    student:     { user: { name: l.participants[0]?.student.name ?? "Aluno" } },
    subject:     { name: l.subject?.name ?? "–" },
  }))

  // Derive base URL for ICS link
  const hdrs    = await headers()
  const host    = hdrs.get("host") ?? "localhost:3000"
  const proto   = host.startsWith("localhost") ? "http" : "https"
  const baseUrl = `${proto}://${host}`

  const calendarToken = teacher ? generateCalendarToken(teacher.id) : ""

  return (
    <div className="space-y-6">
      <PageHeader title="MINHA AGENDA" description="Aulas agendadas" />

      {/* Interactive agenda (list + calendar views + sync) */}
      <TeacherAgendaView
        lessons={serialisedLessons}
        calendarToken={calendarToken}
        baseUrl={baseUrl}
      />
    </div>
  )
}
