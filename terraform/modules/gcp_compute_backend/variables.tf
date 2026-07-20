variable "project_id" {
  description = "GCP project ID."
  type        = string
}

variable "name" {
  description = "Backend managed instance group name."
  type        = string
}

variable "region" {
  description = "GCP region."
  type        = string
}

variable "machine_type" {
  description = "Compute Engine machine type."
  type        = string
}

variable "source_image" {
  description = "Boot disk image."
  type        = string
  default     = "ubuntu-os-cloud/ubuntu-2404-lts-amd64"
}

variable "boot_disk_size_gb" {
  description = "Boot disk size in GB."
  type        = number
  default     = 30
}

variable "boot_disk_type" {
  description = "Boot disk type."
  type        = string
  default     = "pd-balanced"
}

variable "subnetwork_self_link" {
  description = "Subnet self link for backend VMs."
  type        = string
}

variable "network_tags" {
  description = "Network tags assigned to backend VMs."
  type        = list(string)
}

variable "assign_public_ip" {
  description = "Whether to assign ephemeral public IPs to backend VMs."
  type        = bool
  default     = false
}

variable "service_account_id" {
  description = "Service account ID for backend VMs."
  type        = string
}

variable "service_account_display_name" {
  description = "Display name for the backend VM service account."
  type        = string
  default     = "CMC backend VM"
}

variable "service_account_roles" {
  description = "Project roles granted to the backend VM service account."
  type        = list(string)
  default = [
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/secretmanager.secretAccessor",
    "roles/artifactregistry.reader",
  ]
}

variable "target_size" {
  description = "Managed instance group target size. The stateful backend is restricted to exactly one instance."
  type        = number
  default     = 1

  validation {
    condition     = var.target_size == 1
    error_message = "target_size must be exactly 1 while the backend boot disk is stateful."
  }
}

variable "backend_port_name" {
  description = "Named port used by the load balancer backend service."
  type        = string
  default     = "http"
}

variable "backend_port" {
  description = "HTTP port exposed by Nginx on the backend VM."
  type        = number
  default     = 80
}

variable "autohealing_initial_delay_sec" {
  description = "Seconds to wait after VM creation before MIG autohealing evaluates /livez."
  type        = number
  default     = 600

  validation {
    condition     = var.autohealing_initial_delay_sec >= 300 && var.autohealing_initial_delay_sec <= 3600
    error_message = "autohealing_initial_delay_sec must be between 300 and 3600 seconds."
  }
}

variable "autohealing_enabled" {
  description = "Whether the MIG autohealing policy is attached. Enable only after /livez is deployed and verified."
  type        = bool
  default     = false
}

variable "startup_script" {
  description = "Optional Compute Engine startup script. Do not put secrets here."
  type        = string
  default     = ""
}

variable "metadata" {
  description = "Additional instance metadata."
  type        = map(string)
  default     = {}
}

variable "labels" {
  description = "Labels applied to supported resources."
  type        = map(string)
  default     = {}
}
