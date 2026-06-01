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
  description = "docker-compose, dedicated-node, or managed."
  type        = string
  default     = "docker-compose"
}

variable "subnet_name" {
  description = "Subnet where observability resources or hosts live."
  type        = string
}

variable "components" {
  description = "Observability components to enable."
  type        = list(string)
  default     = ["prometheus", "grafana", "cadvisor"]
}

variable "tags" {
  type    = map(string)
  default = {}
}
