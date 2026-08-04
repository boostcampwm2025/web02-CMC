variable "project_id" {
  description = "GCP project ID."
  type        = string
}

variable "bucket_name" {
  description = "Globally unique Cloud Storage bucket name for frontend assets."
  type        = string
}

variable "location" {
  description = "Cloud Storage bucket location."
  type        = string
}

variable "storage_class" {
  description = "Cloud Storage bucket storage class."
  type        = string
  default     = "STANDARD"
}

variable "force_destroy" {
  description = "Whether Terraform may delete the bucket with objects inside."
  type        = bool
  default     = false
}

variable "uniform_bucket_level_access" {
  description = "Whether to enable uniform bucket-level access."
  type        = bool
  default     = true
}

variable "public_access_prevention" {
  description = "Public access prevention mode. Use inherited when public_read is true."
  type        = string
  default     = "inherited"
}

variable "public_read" {
  description = "Whether allUsers can read frontend objects."
  type        = bool
  default     = true
}

variable "upload_members" {
  description = "IAM members allowed to inspect the bucket and upload, replace, or delete frontend objects."
  type        = list(string)
  default     = []
}

variable "main_page_suffix" {
  description = "Website main page suffix for direct bucket website behavior."
  type        = string
  default     = "index.html"
}

variable "not_found_page" {
  description = "Website not found page for SPA fallback behavior."
  type        = string
  default     = "index.html"
}

variable "cors" {
  description = "CORS rules for the frontend bucket."
  type = list(object({
    origin          = list(string)
    method          = list(string)
    response_header = list(string)
    max_age_seconds = number
  }))
  default = []
}

variable "labels" {
  description = "Labels applied to supported resources."
  type        = map(string)
  default     = {}
}
