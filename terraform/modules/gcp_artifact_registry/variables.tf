variable "project_id" {
  description = "GCP project ID."
  type        = string
}

variable "location" {
  description = "Artifact Registry repository location."
  type        = string
}

variable "repository_id" {
  description = "Artifact Registry repository ID."
  type        = string
}

variable "description" {
  description = "Artifact Registry repository description."
  type        = string
  default     = "CMC Docker images"
}

variable "immutable_tags" {
  description = "Whether Docker image tags are immutable after creation."
  type        = bool
  default     = false
}

variable "push_members" {
  description = "IAM members allowed to push images."
  type        = list(string)
  default     = []
}

variable "pull_members" {
  description = "IAM members allowed to pull images."
  type        = list(string)
  default     = []
}

variable "labels" {
  description = "Labels applied to supported resources."
  type        = map(string)
  default     = {}
}
