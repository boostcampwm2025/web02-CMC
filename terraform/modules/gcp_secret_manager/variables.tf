variable "project_id" {
  description = "GCP project ID."
  type        = string
}

variable "secret_ids" {
  description = "Secret IDs to create without secret versions. Secret values must be added outside Terraform."
  type        = list(string)
  default     = []
}

variable "accessor_members" {
  description = "IAM members granted secretAccessor on the created secrets."
  type        = list(string)
  default     = []
}

variable "labels" {
  description = "Labels applied to supported resources."
  type        = map(string)
  default     = {}
}
