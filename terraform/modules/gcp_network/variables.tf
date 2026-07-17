variable "project_id" {
  description = "GCP project ID."
  type        = string
}

variable "name_prefix" {
  description = "Prefix used for resource names."
  type        = string
}

variable "region" {
  description = "GCP region."
  type        = string
}

variable "network_name" {
  description = "VPC network name."
  type        = string
}

variable "subnet_name" {
  description = "Backend subnet name."
  type        = string
}

variable "subnet_cidr" {
  description = "Backend subnet CIDR block."
  type        = string
}

variable "enable_cloud_nat" {
  description = "Whether to create Cloud Router and Cloud NAT for private outbound access."
  type        = bool
  default     = true
}

variable "enable_private_service_access" {
  description = "Whether to reserve a peering range and connect Service Networking for Cloud SQL private IP."
  type        = bool
  default     = true
}

variable "private_service_access_prefix_length" {
  description = "Prefix length for the Service Networking reserved range."
  type        = number
  default     = 16
}

variable "backend_target_tags" {
  description = "Network tags assigned to backend VM instances."
  type        = list(string)
}

variable "backend_http_ports" {
  description = "HTTP ports on backend VMs that may receive traffic from Google load balancer proxies and health checks."
  type        = list(string)
  default     = ["80"]
}

variable "admin_access_cidrs" {
  description = "Optional administrator CIDRs for direct VM access. Prefer IAP and keep this empty in production."
  type        = list(string)
  default     = []
}

variable "admin_tcp_ports" {
  description = "Optional TCP ports allowed from admin_access_cidrs."
  type        = list(string)
  default     = ["22", "3001", "9090"]
}

variable "labels" {
  description = "Labels applied to supported resources."
  type        = map(string)
  default     = {}
}
