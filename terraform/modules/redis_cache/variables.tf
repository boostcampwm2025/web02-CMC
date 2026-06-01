variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "name" {
  type = string
}

variable "mode" {
  description = "container, managed, or reserved."
  type        = string
  default     = "container"
}

variable "vpc_no" {
  description = "VPC number for managed Redis."
  type        = string
  default     = null
  nullable    = true
}

variable "subnet_no" {
  description = "Subnet number for managed Redis."
  type        = string
  default     = null
  nullable    = true
}

variable "subnet_name" {
  description = "Subnet name if Redis remains conceptual or container-based."
  type        = string
}

variable "product_code" {
  description = "Optional product code for managed Redis."
  type        = string
  default     = null
  nullable    = true
}

variable "engine_version_code" {
  description = "Optional engine version code for managed Redis."
  type        = string
  default     = null
  nullable    = true
}

variable "redis_version" {
  description = "Redis config group version string."
  type        = string
  default     = "7.0.13-simple"
}

variable "product_name" {
  description = "Optional flavor if Redis runs on a dedicated host."
  type        = string
  default     = ""
}

variable "is_ha" {
  type    = bool
  default = false
}

variable "is_backup" {
  type    = bool
  default = false
}

variable "tags" {
  type    = map(string)
  default = {}
}
