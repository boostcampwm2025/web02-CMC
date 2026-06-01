variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "bucket_name" {
  description = "Frontend artifact bucket name."
  type        = string
}

variable "service_domain" {
  description = "User-facing frontend domain."
  type        = string
}

variable "asset_prefix" {
  description = "Object prefix for uploaded frontend assets."
  type        = string
  default     = ""
}

variable "enable_versioning" {
  description = "Whether to keep object versions in the bucket."
  type        = bool
  default     = true
}

variable "cors_allowed_origins" {
  description = "Origins allowed to access assets directly if needed."
  type        = list(string)
  default     = []
}

variable "tags" {
  type    = map(string)
  default = {}
}

