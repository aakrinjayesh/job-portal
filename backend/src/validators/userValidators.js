import { email, z } from 'zod'



const googleAuthValidator = z.object({
  credential: z.string(),
  clientId: z.string(),
  type: z.string()
})


const OtpGenerateValidator = z.object({
  email: z.string().email({ message: "Not a valid email address" })
})


const OtpValidator = z.object({
  email: z.email(),
  otp: z.string()
})


const UploadResumeValidator  = z.object({
  file: z.any()
})


const jobTypeEnum = z.enum(["FullTime", "Contract", "Freelance"])

const userProfileValidator = z.object({
   profilePicture: z
    .string()
    .trim()
    .or(z.null()),
  title: z.string().trim().optional().or(z.literal("").transform(() => null)),

  preferredLocation: z.array(z.string().trim()).default([]),

  currentLocation: z.string().trim().optional().or(z.literal("").transform(() => null)),

  preferredJobType: z
    .array(jobTypeEnum)
    .max(2, { message: "Preferred Job Type can contain at most 2 items" })
    .default([]),

  currentCTC: z.string().trim().optional(),
  expectedCTC: z.string().trim().optional(),
  joiningPeriod: z.string().trim().optional(),
  totalExperience: z.string().trim().optional(),
  relevantSalesforceExperience: z.string().trim().optional(),

  skillsJson: z
    .array(
      z.object({
        name: z.string().trim(),
        experience: z.number().optional(),
        level: z.string().optional(),
      })
    )
    .default([]),

  primaryClouds: z.array(z.record(z.any())).default([]),
  secondaryClouds: z.array(z.record(z.any())).default([]),

  certifications: z.array(z.string().trim()).default([]),
  workExperience: z.array(z.record(z.any())).default([]),
  education: z.array(z.record(z.any())).default([]),

  linkedInUrl: z.string().url(),
  trailheadUrl: z.string().url()
})

const updateSkillsValidator = z.object({
  name: z.string()
})

const updateCertificationsValidator = z.object({
  name: z.string()
})

const updateLocationValidator = z.object({
  name: z.string()
})

const addCloudValidator = z.object({
  name: z.string()
})

export {
  googleAuthValidator,
  OtpGenerateValidator,
  OtpValidator,
  UploadResumeValidator,
  userProfileValidator,
  updateSkillsValidator,
  updateCertificationsValidator,
  updateLocationValidator,
  addCloudValidator
}