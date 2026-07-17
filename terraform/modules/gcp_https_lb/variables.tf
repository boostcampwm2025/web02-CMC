variable "project_id" {
  description = "GCP project ID."
  type        = string
}

variable "name_prefix" {
  description = "Prefix used for load balancer resource names."
  type        = string
}

variable "frontend_bucket_name" {
  description = "Cloud Storage bucket name used by the frontend backend bucket."
  type        = string
}

variable "frontend_hosts" {
  description = "Hostnames routed to the frontend backend bucket."
  type        = list(string)
}

variable "api_hosts" {
  description = "Hostnames routed to the backend API service."
  type        = list(string)
}

variable "api_instance_group" {
  description = "Managed instance group self link used as the backend API group."
  type        = string
}

variable "api_port_name" {
  description = "Named port configured on the API instance group."
  type        = string
  default     = "http"
}

variable "api_port" {
  description = "API backend HTTP port."
  type        = number
  default     = 80
}

variable "health_check_path" {
  description = "HTTP health check path on the backend VM."
  type        = string
  default     = "/healthz"
}

variable "client_ip_header_name" {
  description = "Trusted request header populated by the load balancer with the client IP address."
  type        = string
  default     = "X-CMC-Client-IP"
}

variable "ssl_certificate_domains" {
  description = "Domains included in the Google-managed SSL certificate."
  type        = list(string)
}

variable "enable_cdn" {
  description = "Whether to enable Cloud CDN for the frontend backend bucket."
  type        = bool
  default     = true
}

variable "enable_http_redirect" {
  description = "Whether to create an HTTP forwarding rule that redirects to HTTPS."
  type        = bool
  default     = true
}

variable "backend_timeout_sec" {
  description = "Backend API timeout in seconds."
  type        = number
  default     = 30
}

variable "labels" {
  description = "Labels applied to supported resources."
  type        = map(string)
  default     = {}
}
