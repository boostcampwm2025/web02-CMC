variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_name" {
  type = string
}

variable "vpc_cidr" {
  type = string
}

variable "zone" {
  description = "Zone code such as KR-1 or KR-2."
  type        = string
}

variable "public_subnet_cidr" {
  type = string
}

variable "private_subnet_cidr" {
  type = string
}

variable "public_subnet_name" {
  type = string
}

variable "private_subnet_name" {
  type    = string
  default = null
}

variable "ssh_access_cidrs" {
  description = "CIDRs allowed to access SSH."
  type        = list(string)
  default     = []
}

variable "public_access_cidrs" {
  description = "CIDRs allowed to access public web ports."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "extra_inbound_rules" {
  description = "Additional inbound rules for the default ACG."
  type = list(object({
    protocol    = string
    ip_block    = string
    port_range  = string
    description = string
  }))
  default = []
}

variable "create_private_subnet" {
  description = "Whether to create and manage a private subnet."
  type        = bool
  default     = true
}

variable "manage_default_acg_rules" {
  description = "Whether to manage default ACG rules for the VPC."
  type        = bool
  default     = true
}


variable "create_nat_gateway" {
  description = "Whether to create a public NAT Gateway for private subnet outbound internet access."
  type        = bool
  default     = false
}

variable "nat_subnet_name" {
  description = "Name of the dedicated NAT Gateway subnet."
  type        = string
  default     = null
}

variable "nat_subnet_cidr" {
  description = "CIDR block for the dedicated NAT Gateway subnet."
  type        = string
  default     = null
}

variable "nat_gateway_name" {
  description = "Name of the NAT Gateway."
  type        = string
  default     = null
}

variable "nat_gateway_description" {
  description = "Optional NAT Gateway description."
  type        = string
  default     = null
}

variable "tags" {
  type    = map(string)
  default = {}
}
