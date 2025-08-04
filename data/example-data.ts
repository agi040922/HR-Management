import { Employee, WorkSchedule, ScheduleEvent, ScheduleResource } from '@/types/employee'
import dayjs from 'dayjs'

// 예제 직원 데이터 (자영업자 카페 기준)
export const exampleEmployees: Employee[] = [
  {
    id: 1,
    name: "김민수",
    hourlyWage: 9860, // 2024년 최저임금
    position: "홀서빙",
    phone: "010-1234-5678",
    startDate: "2024-01-01",
    isActive: true
  },
  {
    id: 2,
    name: "이지은",
    hourlyWage: 10000,
    position: "주방보조",
    phone: "010-2345-6789",
    startDate: "2024-01-15",
    isActive: true
  },
  {
    id: 3,
    name: "박준호",
    hourlyWage: 9860,
    position: "계산대",
    phone: "010-3456-7890",
    startDate: "2024-02-01",
    isActive: true
  },
  {
    id: 4,
    name: "최수영",
    hourlyWage: 10500,
    position: "바리스타",
    phone: "010-4567-8901",
    startDate: "2024-01-10",
    isActive: true
  }
]

// 주 15시간 미만으로 설계된 예제 스케줄 (주휴수당 회피)
export const exampleSchedules: WorkSchedule[] = [
  // 김민수 - 주 14시간 (월,수,금 각 4시간 + 토 2시간)
  {
    id: 1,
    employeeId: 1,
    date: "2024-01-15",
    startTime: "09:00",
    endTime: "13:00", // 4시간
    breakTime: 0
  },
  {
    id: 2,
    employeeId: 1,
    date: "2024-01-17",
    startTime: "14:00",
    endTime: "18:00", // 4시간
    breakTime: 0
  },
  {
    id: 3,
    employeeId: 1,
    date: "2024-01-19",
    startTime: "09:00",
    endTime: "13:00", // 4시간
    breakTime: 0
  },
  {
    id: 4,
    employeeId: 1,
    date: "2024-01-20",
    startTime: "16:00",
    endTime: "18:00", // 2시간
    breakTime: 0
  },

  // 이지은 - 주 12시간 (화,목,일 각 4시간)
  {
    id: 5,
    employeeId: 2,
    date: "2024-01-16",
    startTime: "10:00",
    endTime: "14:00", // 4시간
    breakTime: 0
  },
  {
    id: 6,
    employeeId: 2,
    date: "2024-01-18",
    startTime: "15:00",
    endTime: "19:00", // 4시간
    breakTime: 0
  },
  {
    id: 7,
    employeeId: 2,
    date: "2024-01-21",
    startTime: "11:00",
    endTime: "15:00", // 4시간
    breakTime: 0
  },

  // 박준호 - 주 10시간 (월,화 각 5시간)
  {
    id: 8,
    employeeId: 3,
    date: "2024-01-15",
    startTime: "14:00",
    endTime: "19:00", // 5시간
    breakTime: 30
  },
  {
    id: 9,
    employeeId: 3,
    date: "2024-01-16",
    startTime: "14:00",
    endTime: "19:00", // 5시간
    breakTime: 30
  },

  // 최수영 - 주 16시간 (주휴수당 적용 대상)
  {
    id: 10,
    employeeId: 4,
    date: "2024-01-15",
    startTime: "06:00",
    endTime: "10:00", // 4시간
    breakTime: 0
  },
  {
    id: 11,
    employeeId: 4,
    date: "2024-01-16",
    startTime: "06:00",
    endTime: "10:00", // 4시간
    breakTime: 0
  },
  {
    id: 12,
    employeeId: 4,
    date: "2024-01-17",
    startTime: "06:00",
    endTime: "10:00", // 4시간
    breakTime: 0
  },
  {
    id: 13,
    employeeId: 4,
    date: "2024-01-18",
    startTime: "06:00",
    endTime: "10:00", // 4시간
    breakTime: 0
  }
]

// react-big-schedule용 리소스 (직원 목록)
export const scheduleResources: ScheduleResource[] = exampleEmployees.map(emp => ({
  id: emp.id,
  name: `${emp.name} (${emp.position})`
}))

// react-big-schedule용 이벤트 변환 함수
export const convertToScheduleEvents = (schedules: WorkSchedule[], employees: Employee[]): ScheduleEvent[] => {
  return schedules.map(schedule => {
    const employee = employees.find(emp => emp.id === schedule.employeeId)
    const startDateTime = dayjs(`${schedule.date} ${schedule.startTime}`).format('YYYY-MM-DD HH:mm:ss')
    const endDateTime = dayjs(`${schedule.date} ${schedule.endTime}`).format('YYYY-MM-DD HH:mm:ss')
    
    // 근무 시간에 따른 색상 구분
    const workHours = dayjs(`${schedule.date} ${schedule.endTime}`).diff(
      dayjs(`${schedule.date} ${schedule.startTime}`), 'hour', true
    )
    
    let bgColor = '#3b82f6' // 기본 파란색
    if (workHours >= 8) bgColor = '#ef4444' // 8시간 이상 빨간색 (장시간 근무)
    else if (workHours >= 6) bgColor = '#f59e0b' // 6시간 이상 주황색
    else if (workHours >= 4) bgColor = '#10b981' // 4시간 이상 녹색
    else bgColor = '#6b7280' // 4시간 미만 회색

    return {
      id: schedule.id,
      start: startDateTime,
      end: endDateTime,
      resourceId: schedule.employeeId,
      title: `${employee?.name || '직원'} - ${workHours}시간`,
      bgColor,
      showPopover: true
    }
  })
}

// 주간 근무시간 계산 함수
export const calculateWeeklyHours = (employeeId: number, schedules: WorkSchedule[]): number => {
  const employeeSchedules = schedules.filter(s => s.employeeId === employeeId)
  
  return employeeSchedules.reduce((total, schedule) => {
    const hours = dayjs(`${schedule.date} ${schedule.endTime}`).diff(
      dayjs(`${schedule.date} ${schedule.startTime}`), 'hour', true
    )
    const breakHours = (schedule.breakTime || 0) / 60
    return total + (hours - breakHours)
  }, 0)
}

// 주휴수당 계산 함수
export const calculateWeeklyHolidayPay = (employeeId: number, schedules: WorkSchedule[], employees: Employee[]): number => {
  const weeklyHours = calculateWeeklyHours(employeeId, schedules)
  const employee = employees.find(emp => emp.id === employeeId)
  
  if (!employee || weeklyHours < 15) return 0
  
  // 주 15시간 이상 근무 시 하루치 일당 (8시간 기준)
  return employee.hourlyWage * 8
}
