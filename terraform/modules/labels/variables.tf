variable "project" {
  description = "Service or project identifier."
  type        = string
}

variable "environment" {
  description = "Environment name such as dev or prod."
  type        = string
}

variable "component" {
  description = "Infra component name."
  type        = string
}

variable "extra_tags" {
  description = "Additional free-form tags or labels."
  type        = map(string)
  default     = {}
}

