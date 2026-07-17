variable "project_id" {
  description = "GCP project ID."
  type        = string
}

variable "create_zone" {
  description = "Whether to create a Cloud DNS managed zone."
  type        = bool
  default     = true
}

variable "create_records" {
  description = "Whether to create frontend and API A records."
  type        = bool
  default     = true
}

variable "managed_zone_name" {
  description = "Cloud DNS managed zone name."
  type        = string
}

variable "dns_name" {
  description = "DNS zone name with trailing dot."
  type        = string
}

variable "frontend_domain" {
  description = "Frontend FQDN without trailing dot."
  type        = string
}

variable "api_domain" {
  description = "API FQDN without trailing dot."
  type        = string
}

variable "load_balancer_ip" {
  description = "Load balancer IPv4 address for A records."
  type        = string
}

variable "ttl" {
  description = "DNS record TTL."
  type        = number
  default     = 300
}

variable "labels" {
  description = "Labels applied to supported resources."
  type        = map(string)
  default     = {}
}
