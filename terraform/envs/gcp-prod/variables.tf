variable "gcp_project_id" {
  description = "GCP project ID."
  type        = string
}

variable "project" {
  description = "Project name used for resource naming."
  type        = string
  default     = "cmc"
}

variable "owner" {
  description = "Owner label value."
  type        = string
}

variable "cost_center" {
  description = "Cost center label value."
  type        = string
  default     = "cmc"
}

variable "region" {
  description = "GCP region."
  type        = string
  default     = "asia-northeast3"
}

variable "zone" {
  description = "GCP zone."
  type        = string
  default     = "asia-northeast3-a"
}

variable "root_domain" {
  description = "Root domain."
  type        = string
}

variable "frontend_subdomain" {
  description = "Frontend subdomain. Use an empty string for apex domain."
  type        = string
  default     = "www"
}

variable "api_subdomain" {
  description = "API subdomain."
  type        = string
  default     = "api"
}

variable "frontend_bucket_name" {
  description = "Globally unique frontend Cloud Storage bucket name."
  type        = string
}

variable "frontend_bucket_location" {
  description = "Frontend bucket location."
  type        = string
  default     = "ASIA-NORTHEAST3"
}

variable "frontend_force_destroy" {
  description = "Whether the frontend bucket can be deleted with objects."
  type        = bool
  default     = false
}

variable "backend_subnet_cidr" {
  description = "Backend subnet CIDR block."
  type        = string
  default     = "10.30.10.0/24"
}

variable "enable_cloud_nat" {
  description = "Whether to create Cloud NAT."
  type        = bool
  default     = true
}

variable "admin_access_cidrs" {
  description = "Optional direct admin CIDRs. Prefer IAP and leave empty."
  type        = list(string)
  default     = []
}

variable "admin_tcp_ports" {
  description = "Optional direct admin TCP ports."
  type        = list(string)
  default     = ["22", "3001", "9090"]
}

variable "backend_machine_type" {
  description = "Backend VM machine type."
  type        = string
  default     = "e2-medium"
}

variable "backend_source_image" {
  description = "Backend VM boot image."
  type        = string
  default     = "ubuntu-os-cloud/ubuntu-2404-lts-amd64"
}

variable "backend_boot_disk_size_gb" {
  description = "Backend VM boot disk size."
  type        = number
  default     = 50
}

variable "backend_assign_public_ip" {
  description = "Whether to assign public IP to backend VM. Prefer false with IAP."
  type        = bool
  default     = false
}

variable "backend_startup_script" {
  description = "Optional backend startup script. Do not put secrets here."
  type        = string
  default     = ""
}

variable "backend_target_size" {
  description = "Backend MIG target size. Keep 1 until backend is stateless."
  type        = number
  default     = 1
}

variable "backend_autohealing_initial_delay_sec" {
  description = "Seconds before MIG autohealing starts evaluating backend liveness."
  type        = number
  default     = 600
}

variable "backend_autohealing_enabled" {
  description = "Attach MIG autohealing only after /livez has been deployed and verified."
  type        = bool
  default     = false
}

variable "github_repository" {
  description = "GitHub repository allowed to request deployment credentials."
  type        = string
  default     = "boostcampwm2025/web02-CMC"
}

variable "github_repository_id" {
  description = "Immutable numeric GitHub repository ID used by the WIF condition."
  type        = string
  default     = "1112846451"
}

variable "github_repository_owner_id" {
  description = "Immutable numeric GitHub repository owner ID used by the WIF condition."
  type        = string
  default     = "221258485"
}

variable "backend_service_account_roles" {
  description = "Project roles granted to backend VM service account."
  type        = list(string)
  default = [
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
  ]
}

variable "artifact_registry_repository_id" {
  description = "Artifact Registry Docker repository ID."
  type        = string
  default     = "cmc"
}

variable "artifact_registry_push_members" {
  description = "IAM members allowed to push images."
  type        = list(string)
  default     = []
}

variable "artifact_registry_pull_members" {
  description = "Additional IAM members allowed to pull images."
  type        = list(string)
  default     = []
}

variable "cloud_sql_tier" {
  description = "Cloud SQL tier."
  type        = string
  default     = "db-g1-small"
}

variable "cloud_sql_edition" {
  description = "Cloud SQL edition. PostgreSQL 16 defaults to ENTERPRISE_PLUS unless explicitly set."
  type        = string
  default     = "ENTERPRISE"
}

variable "cloud_sql_database_version" {
  description = "Cloud SQL database version."
  type        = string
  default     = "POSTGRES_16"
}

variable "cloud_sql_disk_size_gb" {
  description = "Cloud SQL disk size."
  type        = number
  default     = 50
}

variable "cloud_sql_deletion_protection" {
  description = "Whether Cloud SQL deletion protection is enabled."
  type        = bool
  default     = true
}

variable "database_name" {
  description = "Application database name."
  type        = string
  default     = "cmc"
}

variable "secret_ids" {
  description = "Secret Manager secret IDs to create without secret values."
  type        = list(string)
  default = [
    "cmc-prod-database-url",
    "cmc-prod-redis-host",
    "cmc-prod-jwt-secret",
    "cmc-prod-oauth",
    "cmc-prod-gemini-api-keys",
    "cmc-prod-sentry",
  ]
}

variable "create_dns_zone" {
  description = "Whether to create a Cloud DNS managed zone."
  type        = bool
  default     = true
}

variable "create_dns_records" {
  description = "Whether to create frontend/API DNS records."
  type        = bool
  default     = true
}

variable "managed_zone_name" {
  description = "Cloud DNS managed zone name."
  type        = string
}

variable "dns_record_ttl" {
  description = "DNS record TTL."
  type        = number
  default     = 300
}
