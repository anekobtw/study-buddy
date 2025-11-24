export interface Student {
  uid: string
  fullName: string
  USFEmail: string
  preferredStudyTime: number
  classes: { [className: string]: number }
  major: string
  year: string
  description: string
  pfp?: string
}

