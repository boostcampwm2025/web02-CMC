variable "project" {
  type    = string
  default = "cmc"
}

variable "owner" {
  type = string
}

variable "cost_center" {
  type    = string
  default = "cmc"
}

variable "zone" {
  type    = string
  default = "KR-1"
}

variable "vpc_name" {
  type = string
}

variable "vpc_cidr" {
  type = string
}

variable "public_subnet_name" {
  type = string
}

variable "public_subnet_cidr" {
  type = string
}

variable "ssh_access_cidrs" {
  type    = list(string)
  default = []
}

variable "public_access_cidrs" {
  type    = list(string)
  default = ["0.0.0.0/0"]
}

variable "extra_public_inbound_rules" {
  type = list(object({
    protocol    = string
    ip_block    = string
    port_range  = string
    description = string
  }))
  default = []
}

variable "server_name" {
  type = string
}

variable "server_description" {
  type    = string
  default = ""
}

variable "public_ip_description" {
  type     = string
  default  = null
  nullable = true
}

variable "server_image_name" {
  type = string
}

variable "server_hypervisor_type" {
  type    = string
  default = "KVM"
}

variable "server_spec_code" {
  type = string
}

variable "login_key_name" {
  type = string
}

variable "server_init_script" {
  description = "Optional override for the backend server bootstrap script. Set null to use the default Docker Compose bootstrap."
  type        = string
  default     = null
  nullable    = true
}

variable "is_protect_server_termination" {
  type    = bool
  default = false
}

variable "observability_mode" {
  type    = string
  default = "docker-compose"
}
