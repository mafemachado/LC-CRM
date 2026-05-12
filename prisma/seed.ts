import { PrismaClient, Role, LessonStatus, LessonModality, PaymentStatus, PackageStatus, RequestStatus } from "@prisma/client"
import bcrypt from "bcryptjs"
import { subMonths, addHours, startOfMonth, setHours, setMinutes } from "date-fns"

const prisma = new PrismaClient()
const hash   = (pwd: string) => bcrypt.hash(pwd, 10)
const now    = new Date()

// Gera uma data N meses atrás + offset de dias, na hora H
function pastDate(monthsAgo: number, dayOffset = 0, hour = 10) {
  const d = subMonths(now, monthsAgo)
  d.setDate(Math.min(28, d.getDate() + dayOffset))
  return setMinutes(setHours(d, hour), 0)
}

async function main() {
  console.log("🌱 Limpando dados antigos...")
  await prisma.activityLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.teacherPayout.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.homework.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.lessonRequest.deleteMany()
  await prisma.lessonPackage.deleteMany()
  await prisma.teacherSubject.deleteMany()
  await prisma.material.deleteMany()
  await prisma.student.deleteMany()
  await prisma.guardian.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.user.deleteMany()
  console.log("✅ Banco limpo")

  // ─── Matérias ──────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.subject.create({ data: { id: "sub-mat", name: "Matemática",  level: "Todos"               } }),
    prisma.subject.create({ data: { id: "sub-por", name: "Português",   level: "Todos"               } }),
    prisma.subject.create({ data: { id: "sub-fis", name: "Física",      level: "Ensino Médio/Superior" } }),
    prisma.subject.create({ data: { id: "sub-qui", name: "Química",     level: "Ensino Médio/Superior" } }),
    prisma.subject.create({ data: { id: "sub-bio", name: "Biologia",    level: "Ensino Médio/Superior" } }),
    prisma.subject.create({ data: { id: "sub-his", name: "História",    level: "Todos"               } }),
    prisma.subject.create({ data: { id: "sub-geo", name: "Geografia",   level: "Todos"               } }),
    prisma.subject.create({ data: { id: "sub-ing", name: "Inglês",      level: "Todos"               } }),
  ])
  console.log("✅ 8 matérias")

  // ─── Admin ─────────────────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      id: "user-admin", name: "Administrador",
      email: "admin@licaodecasa.com.br", password: await hash("Admin@123"),
      role: Role.ADMIN, phone: "(15) 99999-0001",
    },
  })

  // ─── Colaboradores ─────────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      id: "user-colab1", name: "Júlia Mendes",
      email: "julia@licaodecasa.com.br", password: await hash("Colab@123"),
      role: Role.COLLABORATOR, phone: "(15) 99999-0002",
    },
  })
  console.log("✅ Admin + Colaborador")

  // ─── Professores ───────────────────────────────────────────────────────────
  const avail5days = { "1": [{ start: "08:00", end: "18:00" }], "2": [{ start: "08:00", end: "18:00" }], "3": [{ start: "08:00", end: "18:00" }], "4": [{ start: "08:00", end: "18:00" }], "5": [{ start: "08:00", end: "17:00" }] }
  const availMWF   = { "1": [{ start: "09:00", end: "19:00" }], "3": [{ start: "09:00", end: "19:00" }], "5": [{ start: "09:00", end: "17:00" }] }
  const availTTh   = { "2": [{ start: "14:00", end: "20:00" }], "4": [{ start: "14:00", end: "20:00" }], "6": [{ start: "09:00", end: "14:00" }] }

  const teacherDefs = [
    { uid: "user-prof1", tid: "teacher-1", name: "Ana Beatriz Silva",   email: "ana@licaodecasa.com.br",     rate: 80,  avail: avail5days, subs: ["sub-mat","sub-fis"] },
    { uid: "user-prof2", tid: "teacher-2", name: "Carlos Eduardo Lima", email: "carlos@licaodecasa.com.br",  rate: 75,  avail: availMWF,   subs: ["sub-por","sub-his"] },
    { uid: "user-prof3", tid: "teacher-3", name: "Fernanda Rocha",      email: "fernanda@licaodecasa.com.br",rate: 90,  avail: avail5days, subs: ["sub-qui","sub-bio"] },
    { uid: "user-prof4", tid: "teacher-4", name: "Marcos Oliveira",     email: "marcos@licaodecasa.com.br",  rate: 70,  avail: availTTh,   subs: ["sub-mat","sub-geo"] },
    { uid: "user-prof5", tid: "teacher-5", name: "Patricia Santos",     email: "patricia@licaodecasa.com.br",rate: 85,  avail: availMWF,   subs: ["sub-ing","sub-por"] },
    { uid: "user-prof6", tid: "teacher-6", name: "Renato Alves",        email: "renato@licaodecasa.com.br",  rate: 72,  avail: availTTh,   subs: ["sub-fis","sub-mat"] },
  ]

  for (const t of teacherDefs) {
    await prisma.user.create({
      data: { id: t.uid, name: t.name, email: t.email, password: await hash("Prof@123"), role: Role.TEACHER, phone: "(15) 9" + Math.floor(Math.random()*9000+1000) + "-" + Math.floor(Math.random()*9000+1000) },
    })
    await prisma.teacher.create({
      data: {
        id: t.tid, userId: t.uid, hourlyRate: t.rate,
        bio: `Professora especialista com mais de 5 anos de experiência em reforço escolar.`,
        availability: t.avail,
        subjects: { create: t.subs.map((s) => ({ subjectId: s })) },
      },
    })
  }
  console.log("✅ 6 professores")

  // ─── Alunos ────────────────────────────────────────────────────────────────
  const studentDefs = [
    { uid: "user-stu1",  sid: "student-1",  name: "Lucas Alves",       email: "lucas@email.com",       grade: "9º EF"      },
    { uid: "user-stu2",  sid: "student-2",  name: "Isabela Ferreira",  email: "isabela@email.com",     grade: "1º EM"      },
    { uid: "user-stu3",  sid: "student-3",  name: "Gabriel Souza",     email: "gabriel@email.com",     grade: "2º EM"      },
    { uid: "user-stu4",  sid: "student-4",  name: "Maria Clara Lima",  email: "mariaclara@email.com",  grade: "3º EM"      },
    { uid: "user-stu5",  sid: "student-5",  name: "Pedro Henrique",    email: "pedro@email.com",       grade: "Vestibular" },
    { uid: "user-stu6",  sid: "student-6",  name: "Larissa Costa",     email: "larissa@email.com",     grade: "8º EF"      },
    { uid: "user-stu7",  sid: "student-7",  name: "Bruno Martins",     email: "bruno@email.com",       grade: "6º EF"      },
    { uid: "user-stu8",  sid: "student-8",  name: "Amanda Ribeiro",    email: "amanda@email.com",      grade: "7º EF"      },
    { uid: "user-stu9",  sid: "student-9",  name: "Thiago Barbosa",    email: "thiago@email.com",      grade: "1º EM"      },
    { uid: "user-stu10", sid: "student-10", name: "Camila Pereira",    email: "camila@email.com",      grade: "Superior"   },
    { uid: "user-stu11", sid: "student-11", name: "Vinícius Rocha",    email: "vinicius@email.com",    grade: "2º EM"      },
    { uid: "user-stu12", sid: "student-12", name: "Letícia Gomes",     email: "leticia@email.com",     grade: "3º EM"      },
  ]

  for (const s of studentDefs) {
    await prisma.user.create({
      data: { id: s.uid, name: s.name, email: s.email, password: await hash("Aluno@123"), role: Role.STUDENT },
    })
    await prisma.student.create({ data: { id: s.sid, userId: s.uid, grade: s.grade } })
  }
  console.log("✅ 12 alunos")

  // ─── Pacotes de Aulas ──────────────────────────────────────────────────────
  const packageData = [
    { id: "pkg-1",  sid: "student-1",  total: 20, remaining: 4,  price: 90,  status: PackageStatus.ACTIVE },
    { id: "pkg-2",  sid: "student-2",  total: 10, remaining: 2,  price: 95,  status: PackageStatus.ACTIVE },
    { id: "pkg-3",  sid: "student-3",  total: 20, remaining: 6,  price: 90,  status: PackageStatus.ACTIVE },
    { id: "pkg-4",  sid: "student-4",  total: 10, remaining: 0,  price: 90,  status: PackageStatus.EXHAUSTED },
    { id: "pkg-4b", sid: "student-4",  total: 10, remaining: 8,  price: 95,  status: PackageStatus.ACTIVE },
    { id: "pkg-5",  sid: "student-5",  total: 30, remaining: 10, price: 85,  status: PackageStatus.ACTIVE },
    { id: "pkg-6",  sid: "student-6",  total: 10, remaining: 5,  price: 80,  status: PackageStatus.ACTIVE },
    { id: "pkg-7",  sid: "student-7",  total: 10, remaining: 7,  price: 75,  status: PackageStatus.ACTIVE },
    { id: "pkg-8",  sid: "student-8",  total: 20, remaining: 12, price: 80,  status: PackageStatus.ACTIVE },
    { id: "pkg-9",  sid: "student-9",  total: 10, remaining: 3,  price: 90,  status: PackageStatus.ACTIVE },
    { id: "pkg-10", sid: "student-10", total: 20, remaining: 9,  price: 100, status: PackageStatus.ACTIVE },
    { id: "pkg-11", sid: "student-11", total: 10, remaining: 4,  price: 90,  status: PackageStatus.ACTIVE },
    { id: "pkg-12", sid: "student-12", total: 10, remaining: 1,  price: 85,  status: PackageStatus.ACTIVE },
  ]
  for (const p of packageData) {
    await prisma.lessonPackage.create({
      data: {
        id: p.id, studentId: p.sid, totalLessons: p.total,
        remainingLessons: p.remaining, pricePerLesson: p.price,
        purchaseDate: subMonths(now, Math.floor(Math.random() * 6 + 1)),
        status: p.status,
      },
    })
  }
  console.log("✅ Pacotes de aulas")

  // ─── Aulas (últimos 12 meses) ──────────────────────────────────────────────
  // [studentId, teacherId, subjectId, monthsAgo, dayOfMonth, hour, status, rating]
  const lessonDefs: [string,string,string,number,number,number,LessonStatus,number|null][] = [
    // Lucas - Matemática com Ana (muitas aulas realizadas)
    ["student-1","teacher-1","sub-mat",11,5,9,LessonStatus.COMPLETED,5],
    ["student-1","teacher-1","sub-mat",11,12,9,LessonStatus.COMPLETED,5],
    ["student-1","teacher-1","sub-mat",10,3,9,LessonStatus.COMPLETED,4],
    ["student-1","teacher-1","sub-mat",10,10,9,LessonStatus.COMPLETED,5],
    ["student-1","teacher-1","sub-mat",9,7,9,LessonStatus.COMPLETED,4],
    ["student-1","teacher-1","sub-mat",9,14,9,LessonStatus.COMPLETED,5],
    ["student-1","teacher-1","sub-mat",8,4,9,LessonStatus.COMPLETED,5],
    ["student-1","teacher-1","sub-fis",8,11,14,LessonStatus.COMPLETED,4],
    ["student-1","teacher-1","sub-mat",7,2,9,LessonStatus.COMPLETED,5],
    ["student-1","teacher-1","sub-fis",7,9,14,LessonStatus.COMPLETED,3],
    ["student-1","teacher-1","sub-mat",6,6,9,LessonStatus.COMPLETED,5],
    ["student-1","teacher-1","sub-mat",5,1,9,LessonStatus.COMPLETED,4],
    ["student-1","teacher-1","sub-mat",4,3,9,LessonStatus.COMPLETED,5],
    ["student-1","teacher-1","sub-fis",3,5,14,LessonStatus.COMPLETED,5],
    ["student-1","teacher-1","sub-mat",2,2,9,LessonStatus.COMPLETED,5],
    ["student-1","teacher-1","sub-mat",1,4,9,LessonStatus.COMPLETED,4],
    ["student-1","teacher-1","sub-mat",0,6,9,LessonStatus.SCHEDULED,null],
    // Isabela - Português com Carlos
    ["student-2","teacher-2","sub-por",10,8,10,LessonStatus.COMPLETED,4],
    ["student-2","teacher-2","sub-por",9,5,10,LessonStatus.COMPLETED,5],
    ["student-2","teacher-2","sub-his",8,12,15,LessonStatus.COMPLETED,4],
    ["student-2","teacher-2","sub-por",7,3,10,LessonStatus.MISSED,null],
    ["student-2","teacher-2","sub-por",6,7,10,LessonStatus.COMPLETED,5],
    ["student-2","teacher-2","sub-his",5,2,15,LessonStatus.COMPLETED,4],
    ["student-2","teacher-2","sub-por",4,6,10,LessonStatus.COMPLETED,5],
    ["student-2","teacher-2","sub-por",3,8,10,LessonStatus.COMPLETED,4],
    ["student-2","teacher-2","sub-por",2,5,10,LessonStatus.COMPLETED,5],
    ["student-2","teacher-2","sub-por",1,3,10,LessonStatus.COMPLETED,4],
    ["student-2","teacher-2","sub-por",0,7,10,LessonStatus.CONFIRMED,null],
    // Gabriel - Química com Fernanda
    ["student-3","teacher-3","sub-qui",9,4,11,LessonStatus.COMPLETED,5],
    ["student-3","teacher-3","sub-bio",8,10,11,LessonStatus.COMPLETED,4],
    ["student-3","teacher-3","sub-qui",7,6,11,LessonStatus.COMPLETED,5],
    ["student-3","teacher-3","sub-qui",6,12,11,LessonStatus.CANCELLED,null],
    ["student-3","teacher-3","sub-qui",5,4,11,LessonStatus.COMPLETED,4],
    ["student-3","teacher-3","sub-bio",4,9,11,LessonStatus.COMPLETED,5],
    ["student-3","teacher-3","sub-qui",3,3,11,LessonStatus.COMPLETED,5],
    ["student-3","teacher-3","sub-qui",2,6,11,LessonStatus.COMPLETED,4],
    ["student-3","teacher-3","sub-qui",1,2,11,LessonStatus.COMPLETED,5],
    ["student-3","teacher-3","sub-qui",0,8,11,LessonStatus.SCHEDULED,null],
    // Maria Clara - Matemática com Marcos
    ["student-4","teacher-4","sub-mat",11,7,13,LessonStatus.COMPLETED,3],
    ["student-4","teacher-4","sub-geo",10,14,13,LessonStatus.COMPLETED,4],
    ["student-4","teacher-4","sub-mat",9,3,13,LessonStatus.COMPLETED,4],
    ["student-4","teacher-4","sub-mat",8,10,13,LessonStatus.COMPLETED,5],
    ["student-4","teacher-4","sub-geo",7,5,13,LessonStatus.COMPLETED,3],
    ["student-4","teacher-4","sub-mat",6,12,13,LessonStatus.MISSED,null],
    ["student-4","teacher-4","sub-mat",5,4,13,LessonStatus.COMPLETED,4],
    ["student-4","teacher-4","sub-mat",4,8,13,LessonStatus.COMPLETED,5],
    ["student-4","teacher-4","sub-geo",3,2,13,LessonStatus.COMPLETED,4],
    ["student-4","teacher-4","sub-mat",2,6,13,LessonStatus.COMPLETED,5],
    ["student-4","teacher-4","sub-mat",0,10,13,LessonStatus.CONFIRMED,null],
    // Pedro - Inglês com Patricia
    ["student-5","teacher-5","sub-ing",11,6,16,LessonStatus.COMPLETED,5],
    ["student-5","teacher-5","sub-ing",10,13,16,LessonStatus.COMPLETED,5],
    ["student-5","teacher-5","sub-por",9,7,16,LessonStatus.COMPLETED,4],
    ["student-5","teacher-5","sub-ing",8,4,16,LessonStatus.COMPLETED,5],
    ["student-5","teacher-5","sub-ing",7,11,16,LessonStatus.COMPLETED,5],
    ["student-5","teacher-5","sub-ing",6,8,16,LessonStatus.COMPLETED,5],
    ["student-5","teacher-5","sub-por",5,3,16,LessonStatus.COMPLETED,4],
    ["student-5","teacher-5","sub-ing",4,9,16,LessonStatus.COMPLETED,5],
    ["student-5","teacher-5","sub-ing",3,6,16,LessonStatus.COMPLETED,5],
    ["student-5","teacher-5","sub-ing",2,4,16,LessonStatus.COMPLETED,4],
    ["student-5","teacher-5","sub-ing",1,7,16,LessonStatus.COMPLETED,5],
    ["student-5","teacher-5","sub-ing",0,5,16,LessonStatus.SCHEDULED,null],
    // Larissa - Física com Renato
    ["student-6","teacher-6","sub-fis",8,8,9,LessonStatus.COMPLETED,4],
    ["student-6","teacher-6","sub-mat",7,15,9,LessonStatus.COMPLETED,3],
    ["student-6","teacher-6","sub-fis",6,6,9,LessonStatus.COMPLETED,4],
    ["student-6","teacher-6","sub-fis",5,10,9,LessonStatus.COMPLETED,5],
    ["student-6","teacher-6","sub-fis",4,4,9,LessonStatus.COMPLETED,4],
    ["student-6","teacher-6","sub-fis",3,8,9,LessonStatus.COMPLETED,4],
    ["student-6","teacher-6","sub-fis",2,5,9,LessonStatus.CANCELLED,null],
    ["student-6","teacher-6","sub-fis",1,9,9,LessonStatus.COMPLETED,4],
    ["student-6","teacher-6","sub-fis",0,4,9,LessonStatus.SCHEDULED,null],
    // Bruno - Matemática com Marcos
    ["student-7","teacher-4","sub-mat",6,11,10,LessonStatus.COMPLETED,4],
    ["student-7","teacher-4","sub-mat",5,8,10,LessonStatus.COMPLETED,3],
    ["student-7","teacher-4","sub-mat",4,12,10,LessonStatus.COMPLETED,4],
    ["student-7","teacher-4","sub-mat",3,5,10,LessonStatus.COMPLETED,4],
    ["student-7","teacher-4","sub-mat",0,9,10,LessonStatus.SCHEDULED,null],
    // Amanda - Biologia com Fernanda
    ["student-8","teacher-3","sub-bio",7,7,15,LessonStatus.COMPLETED,5],
    ["student-8","teacher-3","sub-bio",6,14,15,LessonStatus.COMPLETED,5],
    ["student-8","teacher-3","sub-qui",5,5,15,LessonStatus.COMPLETED,4],
    ["student-8","teacher-3","sub-bio",4,11,15,LessonStatus.COMPLETED,5],
    ["student-8","teacher-3","sub-bio",3,3,15,LessonStatus.COMPLETED,5],
    ["student-8","teacher-3","sub-bio",2,8,15,LessonStatus.COMPLETED,4],
    ["student-8","teacher-3","sub-bio",1,6,15,LessonStatus.COMPLETED,5],
    ["student-8","teacher-3","sub-bio",0,3,15,LessonStatus.CONFIRMED,null],
    // Thiago - Física com Ana
    ["student-9","teacher-1","sub-fis",5,9,14,LessonStatus.COMPLETED,4],
    ["student-9","teacher-1","sub-fis",4,13,14,LessonStatus.COMPLETED,5],
    ["student-9","teacher-1","sub-mat",3,7,14,LessonStatus.COMPLETED,4],
    ["student-9","teacher-1","sub-fis",2,11,14,LessonStatus.MISSED,null],
    ["student-9","teacher-1","sub-fis",1,5,14,LessonStatus.COMPLETED,4],
    ["student-9","teacher-1","sub-fis",0,8,14,LessonStatus.SCHEDULED,null],
    // Camila - Inglês com Patricia (Superior)
    ["student-10","teacher-5","sub-ing",10,4,17,LessonStatus.COMPLETED,5],
    ["student-10","teacher-5","sub-ing",9,11,17,LessonStatus.COMPLETED,5],
    ["student-10","teacher-5","sub-ing",8,5,17,LessonStatus.COMPLETED,5],
    ["student-10","teacher-5","sub-ing",7,12,17,LessonStatus.COMPLETED,4],
    ["student-10","teacher-5","sub-ing",6,6,17,LessonStatus.COMPLETED,5],
    ["student-10","teacher-5","sub-ing",5,10,17,LessonStatus.COMPLETED,5],
    ["student-10","teacher-5","sub-por",4,3,17,LessonStatus.COMPLETED,4],
    ["student-10","teacher-5","sub-ing",3,8,17,LessonStatus.COMPLETED,5],
    ["student-10","teacher-5","sub-ing",2,5,17,LessonStatus.COMPLETED,5],
    ["student-10","teacher-5","sub-ing",1,9,17,LessonStatus.COMPLETED,5],
    ["student-10","teacher-5","sub-ing",0,6,17,LessonStatus.CONFIRMED,null],
    // Vinícius - Química com Fernanda
    ["student-11","teacher-3","sub-qui",4,7,10,LessonStatus.COMPLETED,3],
    ["student-11","teacher-3","sub-qui",3,14,10,LessonStatus.COMPLETED,4],
    ["student-11","teacher-3","sub-qui",2,4,10,LessonStatus.COMPLETED,4],
    ["student-11","teacher-3","sub-qui",1,11,10,LessonStatus.COMPLETED,4],
    ["student-11","teacher-3","sub-qui",0,5,10,LessonStatus.SCHEDULED,null],
    // Letícia - História com Carlos
    ["student-12","teacher-2","sub-his",3,9,11,LessonStatus.COMPLETED,4],
    ["student-12","teacher-2","sub-por",2,6,11,LessonStatus.COMPLETED,5],
    ["student-12","teacher-2","sub-his",1,13,11,LessonStatus.COMPLETED,5],
    ["student-12","teacher-2","sub-his",0,7,11,LessonStatus.SCHEDULED,null],
  ]

  let lessonCount = 0
  for (const [sid, tid, subid, mo, day, hr, status, rating] of lessonDefs) {
    const scheduledAt = pastDate(mo, day - 15, hr)
    await prisma.lesson.create({
      data: {
        studentId: sid, teacherId: tid, subjectId: subid,
        scheduledAt,
        modality:  mo % 2 === 0 ? LessonModality.PRESENCIAL : LessonModality.ONLINE,
        status,
        studentRating: rating,
        topicsCovered: status === LessonStatus.COMPLETED ? "Revisão do conteúdo programático + exercícios práticos" : null,
      },
    })
    lessonCount++
  }
  console.log(`✅ ${lessonCount} aulas`)

  // ─── Pagamentos (últimos 12 meses) ─────────────────────────────────────────
  // Simula mensalidades por aluno, distribuídas ao longo do ano
  const paymentDefs: { sid: string; amount: number; monthsAgo: number; status: PaymentStatus }[] = []

  // Alunos ativos com histórico de pagamentos
  const studentPayments: { sid: string; amount: number; months: number[] }[] = [
    { sid: "student-1",  amount: 1800, months: [11,10,9,8,7,6,5,4,3,2,1,0] },
    { sid: "student-2",  amount: 950,  months: [10,9,8,7,6,5,4,3,2,1] },
    { sid: "student-3",  amount: 1800, months: [9,8,7,6,5,4,3,2,1,0] },
    { sid: "student-4",  amount: 1800, months: [11,10,9,8,7,6,5,4,3,2] },
    { sid: "student-5",  amount: 2550, months: [11,10,9,8,7,6,5,4,3,2,1,0] },
    { sid: "student-6",  amount: 800,  months: [8,7,6,5,4,3,2,1] },
    { sid: "student-7",  amount: 750,  months: [6,5,4,3] },
    { sid: "student-8",  amount: 1600, months: [7,6,5,4,3,2,1,0] },
    { sid: "student-9",  amount: 900,  months: [5,4,3,2,1] },
    { sid: "student-10", amount: 2000, months: [10,9,8,7,6,5,4,3,2,1,0] },
    { sid: "student-11", amount: 900,  months: [4,3,2,1] },
    { sid: "student-12", amount: 850,  months: [3,2,1] },
  ]

  for (const sp of studentPayments) {
    for (const mo of sp.months) {
      let status: PaymentStatus
      // Mês atual = PENDING para alguns, PAID para maioria histórica
      if (mo === 0) {
        status = sp.sid === "student-7" || sp.sid === "student-11" ? PaymentStatus.OVERDUE : PaymentStatus.PENDING
      } else if (mo === 1 && (sp.sid === "student-4" || sp.sid === "student-9")) {
        status = PaymentStatus.OVERDUE
      } else {
        status = PaymentStatus.PAID
      }
      paymentDefs.push({ sid: sp.sid, amount: sp.amount, monthsAgo: mo, status })
    }
  }

  for (const p of paymentDefs) {
    const dueDate = startOfMonth(subMonths(now, p.monthsAgo))
    dueDate.setDate(10)
    const paidAt  = p.status === PaymentStatus.PAID
      ? new Date(dueDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
      : null
    await prisma.payment.create({
      data: {
        studentId: p.sid, amount: p.amount,
        dueDate, paidAt, status: p.status,
        method:      p.status === PaymentStatus.PAID ? ["PIX","Cartão","Boleto"][Math.floor(Math.random()*3)] : null,
        description: "Pacote de aulas — mensalidade",
      },
    })
  }
  console.log(`✅ ${paymentDefs.length} pagamentos`)

  // ─── Repasses aos Professores ──────────────────────────────────────────────
  const payoutDefs = [
    { tid: "teacher-1", month: now.getMonth() - 1 < 0 ? 11 : now.getMonth(), year: now.getFullYear(), lessons: 18, amount: 1440 },
    { tid: "teacher-2", month: now.getMonth() - 1 < 0 ? 11 : now.getMonth(), year: now.getFullYear(), lessons: 12, amount: 900  },
    { tid: "teacher-3", month: now.getMonth() - 1 < 0 ? 11 : now.getMonth(), year: now.getFullYear(), lessons: 15, amount: 1350 },
    { tid: "teacher-5", month: now.getMonth() - 1 < 0 ? 11 : now.getMonth(), year: now.getFullYear(), lessons: 14, amount: 1190 },
    { tid: "teacher-1", month: now.getMonth() - 2 < 0 ? 10 : now.getMonth() - 1, year: now.getFullYear(), lessons: 16, amount: 1280, paidAt: subMonths(now, 1) },
    { tid: "teacher-5", month: now.getMonth() - 2 < 0 ? 10 : now.getMonth() - 1, year: now.getFullYear(), lessons: 13, amount: 1105, paidAt: subMonths(now, 1) },
  ]
  for (const p of payoutDefs) {
    await prisma.teacherPayout.create({
      data: {
        teacherId: p.tid, month: p.month, year: p.year,
        totalLessons: p.lessons, totalAmount: p.amount,
        paidAt: (p as any).paidAt ?? null,
        status: (p as any).paidAt ? "PAID" : "PENDING",
      },
    })
  }
  console.log("✅ Repasses aos professores")

  // ─── Solicitações Pendentes ────────────────────────────────────────────────
  await prisma.lessonRequest.createMany({
    data: [
      {
        studentId: "student-7", teacherId: "teacher-4", subjectId: "sub-mat",
        preferredAt: addHours(now, 48), status: RequestStatus.PENDING,
        reason: "Preciso de reforço urgente para prova de sexta",
      },
      {
        studentId: "student-11", teacherId: "teacher-3", subjectId: "sub-qui",
        preferredAt: addHours(now, 72), status: RequestStatus.PENDING,
        reason: "Dificuldade com reações químicas",
      },
      {
        studentId: "student-12", teacherId: "teacher-2", subjectId: "sub-his",
        preferredAt: addHours(now, 96), status: RequestStatus.PENDING,
        reason: "Revisão para ENEM",
      },
    ],
  })
  console.log("✅ 3 solicitações pendentes")

  // ─── Notificações ──────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: "user-admin",  type: "PAYMENT_OVERDUE", title: "Inadimplência", message: "2 alunos com pagamentos em atraso.", read: false },
      { userId: "user-admin",  type: "LESSON_REQUEST",  title: "Novas solicitações", message: "3 agendamentos aguardando aprovação.", read: false },
      { userId: "user-colab1", type: "LESSON_REQUEST",  title: "Agendamento pendente", message: "Bruno Martins solicitou aula.", read: false },
      { userId: "user-stu1",   type: "LESSON_CONFIRMED",title: "Aula confirmada", message: "Sua próxima aula de Matemática foi confirmada.", read: false },
      { userId: "user-stu5",   type: "LOW_BALANCE",     title: "Saldo baixo", message: "Você tem apenas 10 aulas restantes no pacote.", read: true },
    ],
  })
  console.log("✅ Notificações")

  console.log("\n🎉 Seed concluído com sucesso!")
  console.log("═".repeat(55))
  console.log("  CREDENCIAIS DE ACESSO")
  console.log("═".repeat(55))
  console.log("  Admin:       admin@licaodecasa.com.br   / Admin@123")
  console.log("  Colaborador: julia@licaodecasa.com.br   / Colab@123")
  console.log("  Professor:   ana@licaodecasa.com.br     / Prof@123")
  console.log("  Aluno:       lucas@email.com            / Aluno@123")
  console.log("═".repeat(55))
  console.log(`  ${lessonCount} aulas · ${paymentDefs.length} pagamentos · 12 alunos · 6 professores`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
