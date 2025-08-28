export interface Employee {
  id: number
  name: string
  position?: string
  hourly_wage: number
  store_id: number
  owner_id: string
  is_active: boolean
  phone?: string
  start_date?: string
  labor_contract?: any
  created_at?: string
  updated_at?: string
}

export interface Store {
  id: number
  store_name: string
  time_slot_minutes: number
  owner_id: string
  created_at?: string
  updated_at?: string
}

export interface WorkSchedule {
  id: number
  employee_id: number
  store_id: number
  owner_id: string
  date: string
  start_time: string
  end_time: string
  break_minutes: number
  is_holiday: boolean
}

export interface WeeklyTemplate {
  id: number
  template_name: string
  store_id: number
  owner_id: string
  is_active: boolean
}

export interface PayrollData {
  employee: Employee
  weeklyHours: number
  regularHours: number
  overtimeHours: number
  nightHours: number
  regularPay: number
  overtimePay: number
  nightPay: number
  holidayPay: number
  totalPay: number
  isEligibleForHolidayPay: boolean
  monthlySalary?: number
  netSalary?: number
}

export interface StorePayrollData {
  store: Store
  template?: WeeklyTemplate
  payrollData: PayrollData[]
  totals: PayrollTotals
}

export interface PayrollTotals {
  totalEmployees: number
  totalHours: number
  totalRegularPay: number
  totalOvertimePay: number
  totalNightPay: number
  totalHolidayPay: number
  totalPay: number
}

export interface PayrollFilters {
  searchTerm: string
  filterStatus: 'all' | 'holiday-eligible' | 'holiday-not-eligible'
  selectedPeriod: 'current-week' | 'last-week' | 'current-month'
}

export interface PayrollState {
  stores: Store[]
  employees: Employee[]
  schedules: WorkSchedule[]
  templates: WeeklyTemplate[]
  selectedStores: Set<number>
  storeTemplates: Map<number, WeeklyTemplate>
  storePayrollData: StorePayrollData[]
  filters: PayrollFilters
  expandedRows: Set<number>
  loading: boolean
  error: string | null
  showHelp: boolean
}
