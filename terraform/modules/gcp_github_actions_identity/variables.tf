variable "project_id" {
  description = "GCP project ID."
  type        = string
}

variable "environment" {
  description = "GitHub Environment and deployment environment name."
  type        = string
}

variable "pool_id" {
  description = "Workload Identity Pool ID."
  type        = string
}

variable "pool_display_name" {
  description = "Workload Identity Pool display name."
  type        = string
}

variable "provider_id" {
  description = "OIDC provider ID within the Workload Identity Pool."
  type        = string
  default     = "github"
}

variable "service_account_id" {
  description = "GitHub Actions deployer service account ID."
  type        = string
}

variable "service_account_display_name" {
  description = "GitHub Actions deployer service account display name."
  type        = string
}

variable "github_repository" {
  description = "GitHub repository in owner/name form."
  type        = string
}

variable "github_repository_id" {
  description = "Immutable numeric GitHub repository ID."
  type        = string
}

variable "github_repository_owner_id" {
  description = "Immutable numeric GitHub repository owner ID."
  type        = string
}

variable "allowed_refs" {
  description = "Exact Git refs allowed to request deployment credentials."
  type        = list(string)

  validation {
    condition     = alltrue([for ref in var.allowed_refs : startswith(ref, "refs/")])
    error_message = "Each allowed ref must start with refs/."
  }
}

variable "allow_version_tags" {
  description = "Whether refs/tags/v* may request deployment credentials."
  type        = bool
  default     = false
}

variable "project_roles" {
  description = "Project-level roles granted to the GitHub Actions deployer."
  type        = list(string)
  default = [
    "roles/compute.osAdminLogin",
    "roles/compute.viewer",
    "roles/iap.tunnelResourceAccessor",
    "roles/serviceusage.serviceUsageConsumer",
  ]
}

variable "backend_service_account_emails" {
  description = "Backend VM service accounts that the deployer may act as while connecting with OS Login."
  type        = list(string)
  default     = []
}
