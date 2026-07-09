import { z } from "zod"

export const AttributeType = z.enum([
  "STRING",
  "NUMBER",
  "SWITCH",
  "SELECT",
  "MULTI_SELECT",
  "TIME",
  "DATE",
])

export const JobStatus = z.enum(["CREATED", "EXECUTED", "APPROVED", "FINISHED"])

export const WorkingType = z.enum(["DOING", "ADDITIONAL_DOING"])

export const ServiceType = z.enum(["TOOL"])

export const ObjectActivationStatus = z.enum(["ACTIVATE", "DEACTIVATE"])

export const BookingType = z.enum(["EXPENSE", "FLAT_RATE", "MILEAGE"])

export const SettingType = z.enum(["STRING", "NUMBER", "BOOLEAN", "JSON"])

export const UserSettingType = z.enum(["STRING", "NUMBER", "BOOLEAN", "JSON"])

export const EmployeeRole = z.enum(["ADMIN", "FOREMAN", "EMPLOYEE"])

export const AbsenceApprovalStatus = z.enum(["PENDING", "APPROVED", "DENIED"])

export const AttributeValueTO = z.object({
  attributeId: z.string(),
  value: z.string().optional(),
})

export const JobAttributeValueTO = z.object({
  attributeId: z.string(),
  value: z.string().optional(),
})

export const PhoneNumberTO = z.object({
  label: z.string().optional(),
  number: z.string(),
})
