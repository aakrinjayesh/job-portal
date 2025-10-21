import {  z } from 'zod'



const googleAuthValidator = z.object({
  credential: z.string(),
  clientId: z.string(),
  type: z.string()
})


const OtpGenerateValidator = z.object({
  email: z.string().email({ message: "Not a valid email address" }),
  role: z.string()
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


// Job listing validators
const getJobListValidator = z.object({
  // TODO: Add filter parameters
})

const postJobValidator = z.object({
  // TODO: Add job creation fields
})

// Job application validators
const applyJobValidator = z.object({
  // TODO: Add application fields if needed
})

const withdrawJobValidator = z.object({
  // TODO: Add withdrawal fields if needed
})

// Saved jobs validators
const saveJobValidator = z.object({
  // TODO: Add save job fields if needed
})

const removeSavedJobValidator = z.object({
  // TODO: Add remove saved job fields if needed
})

// Company job management validators
const editJobValidator = z.object({
  editid: z.string(),
  role: z.string(),
  description: z.string(),

  employmentType: z
    .enum(["FullTime", "PartTime", "Internship", "Contract", "Freelance"]),

  experience: z.string(),
  experienceLevel: z
    .enum(["Internship", "EntryLevel", "Mid", "Senior", "Lead"]),

  location: z.string(),

  skills: z.array(z.string().min(1)),

  responsibilities: z.array(z.string().min(1)),
  qualifications: z.array(z.string().min(1)),

  salary: z
    .number({ invalid_type_error: "salary must be a number" })
    .int()
    .nonnegative(),

  companyName: z.string().optional(),

  jobType: z.string().optional(),

  status: z.enum(["Open", "Closed", "Draft"]).optional(),

  applicationDeadline: z
    .string()
    .optional(),
  postedById: z.string().optional(),
})

const deleteJobValidator = z.object({
  deleteList: z.array()
  // TODO: Add delete confirmation fields if needed
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
  addCloudValidator,
  getJobListValidator,
  postJobValidator,
  applyJobValidator,
  withdrawJobValidator,
  saveJobValidator,
  removeSavedJobValidator,
  editJobValidator,
  deleteJobValidator
}