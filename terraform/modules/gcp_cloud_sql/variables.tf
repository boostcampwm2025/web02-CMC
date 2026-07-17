variable "project_id" {
  description = "GCP project ID."
  type        = string
}

variable "name" {
  description = "Cloud SQL instance name."
  type        = string
}

variable "region" {
  description = "GCP region."
  type        = string
}

variable "database_version" {
  description = "Cloud SQL database version."
  type        = string
  default     = "POSTGRES_16"
}

variable "tier" {
  description = "Cloud SQL machine tier."
  type        = string
}

variable "edition" {
  description = "Cloud SQL edition. Use ENTERPRISE for shared-core/custom tiers such as db-f1-micro. ENTERPRISE_PLUS requires db-perf-optimized-* tiers."
  type        = string
  default     = "ENTERPRISE"
}

variable "availability_type" {
  description = "Cloud SQL availability type."
  type        = string
  default     = "ZONAL"
}

variable "disk_type" {
  description = "Cloud SQL disk type."
  type        = string
  default     = "PD_SSD"
}

variable "disk_size_gb" {
  description = "Cloud SQL disk size in GB."
  type        = number
  default     = 20
}

variable "disk_autoresize" {
  description = "Whether Cloud SQL disk autoresize is enabled."
  type        = bool
  default     = true
}

variable "private_network" {
  description = "VPC network self link for Cloud SQL private IP."
  type        = string
}

variable "ipv4_enabled" {
  description = "Whether Cloud SQL public IPv4 is enabled."
  type        = bool
  default     = false
}

variable "database_name" {
  description = "Application database name."
  type        = string
  default     = "cmc"
}

variable "backup_enabled" {
  description = "Whether automated backup is enabled."
  type        = bool
  default     = true
}

variable "backup_start_time" {
  description = "Backup start time in HH:MM format."
  type        = string
  default     = "18:00"
}

variable "point_in_time_recovery_enabled" {
  description = "Whether PITR is enabled."
  type        = bool
  default     = true
}

variable "maintenance_window_day" {
  description = "Maintenance day, 1-7 starting Monday."
  type        = number
  default     = 7
}

variable "maintenance_window_hour" {
  description = "Maintenance hour, 0-23 UTC."
  type        = number
  default     = 19
}

variable "maintenance_window_update_track" {
  description = "Maintenance update track."
  type        = string
  default     = "stable"
}

variable "deletion_protection" {
  description = "Whether deletion protection is enabled for the Cloud SQL instance."
  type        = bool
  default     = true
}

variable "labels" {
  description = "Labels applied to supported resources."
  type        = map(string)
  default     = {}
}
