export type JobStatus = "CREATED" | "EXECUTED" | "APPROVED" | "FINISHED"

export interface DimaconJob {
  id: string
  projectId: string
  customerId: string
  versionNr?: number
  description?: string
  jobStatus?: JobStatus
  invoiceNumber?: string
  offerNumber?: string
  dueDate?: string
  nrOfAppointments?: number
  nrOfWorkings?: number
  additionalInformation?: string
  isArchived?: boolean
  scheduledDateConfirmed?: boolean
  color?: string
  [key: string]: unknown
}

export interface DimaconTeamAssignment {
  id: string
  teamId: string
  employeeId: string
  date: string
  isFixed: boolean
}

export interface DimaconFullJobData {
  job: DimaconJob
  teamAssignments: DimaconTeamAssignment[]
}
