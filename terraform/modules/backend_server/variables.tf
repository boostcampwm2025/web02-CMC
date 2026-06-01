variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "name" {
  type = string
}

variable "server_image_name" {
  description = "Base image name to use for the instance."
  type        = string
}

variable "server_spec_code" {
  description = "Server spec code such as c2-g3 or c2-g2-s50."
  type        = string
}

variable "server_hypervisor_type" {
  description = "Server hypervisor type."
  type        = string
  default     = "KVM"
}

variable "fee_system_type_code" {
  description = "Optional NCP server fee system type code. Micro servers require FXSUM."
  type        = string
  default     = null
  nullable    = true
}

variable "subnet_no" {
  description = "Subnet number where the server should live."
  type        = string
}

variable "login_key_name" {
  description = "SSH login key configured in NCP."
  type        = string
}

variable "associate_public_ip" {
  description = "Whether to attach a public IP to the server."
  type        = bool
  default     = true
}

variable "public_ip_description" {
  description = "Optional description for the managed public IP."
  type        = string
  default     = null
  nullable    = true
}

variable "init_script" {
  description = "Cloud-init or user data script for server bootstrap."
  type        = string
  default     = ""
}

variable "description" {
  description = "Optional instance description."
  type        = string
  default     = ""
}

variable "is_protect_server_termination" {
  description = "Whether to protect the instance from accidental termination."
  type        = bool
  default     = true
}

variable "tags" {
  type    = map(string)
  default = {}
}
