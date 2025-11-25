export interface Student {
  uid?: string
  usf_email: string
  full_name?: string
  fullName?: string
  USFEmail?: string
  preferred_study_time?: number
  preferredStudyTime?: number
  classes: { [className: string]: number } | string
  major: string
  year: string
  description: string
  pfp?: string
}

