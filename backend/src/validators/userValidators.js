import { z } from 'zod'

const registerInputValidator = z.object({
  name: z
  .string()
  .trim()
  .min(3, { message: "Name must be at least 3 characters long" }),
  email: z
    .string()
    .email({ message: "Not a valid email address" })
    .trim(),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

const loginInputValidator = z.object({
    email: z.string().email({ message: "Not a valid email address" }),
    password: z.string().min(8,{ message: "Password must be at least 8 characters long" }),
})

const jobTypeEnum = z.enum(["FullTime", "Contract", "Freelance"])

const userProfileValidator = z.object({
  profilePicture: z.string().trim().url().nullable().optional().or(z.literal('').transform(() => null)).or(z.null()),
  preferredLocation: z.array(z.string().trim()).default([]),
  preferredJobType: z.array(jobTypeEnum)
    .max(2, { message: "Preferred Job Type can contain at most 2 items" })
    .default([]),
  currentCTC: z.string().trim().nullable().optional().or(z.null()),
  expectedCTC: z.string().trim().nullable().optional().or(z.null()),
  joiningPeriod: z.string().trim().nullable().optional().or(z.null()),
  totalExperience: z.string().trim().nullable().optional().or(z.null()),
  relevantSalesforceExperience: z.string().trim().nullable().optional().or(z.null()),
  skills: z.array(z.string().trim()).default([]),
  certifications: z.array(z.string().trim()).default([]),
  workExperience: z.array(z.string().trim()).default([])
}).transform((data) => {
  const normalizedTypes = (data.preferredJobType || []).filter((t) => ["FullTime", "Contract", "Freelance"].includes(t))
  return { ...data, preferredJobType: normalizedTypes.slice(0, 2) }
})


const OtpValidator = z.object({
  email: z.string().email({ message: "Not a valid email address" })
})






export {
  registerInputValidator,
  loginInputValidator,
  userProfileValidator,
  OtpValidator
}