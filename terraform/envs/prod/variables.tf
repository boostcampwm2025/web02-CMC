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

variable "root_domain" {
  type = string
}

variable "frontend_subdomain" {
  type    = string
  default = "www"
}

variable "api_subdomain" {
  type    = string
  default = "api"
}

variable "frontend_bucket_name" {
  type = string
}

variable "frontend_asset_prefix" {
  type    = string
  default = ""
}

variable "frontend_certificate_name" {
  type = string
}

variable "zone" {
  type    = string
  default = "KR-2"
}

variable "vpc_cidr" {
  type    = string
  default = "10.10.0.0/16"
}

variable "public_subnet_cidr" {
  type    = string
  default = "10.10.10.0/24"
}

variable "private_subnet_cidr" {
  type    = string
  default = "10.10.20.0/24"
}


variable "nat_subnet_cidr" {
  type    = string
  default = "10.10.30.0/24"
}

variable "nat_subnet_name" {
  type    = string
  default = "cmc-prod-nat-subnet"
}

variable "nat_gateway_name" {
  type    = string
  default = "cmc-prod-nat"
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
  type    = string
  default = ""
}

variable "postgres_server_name" {
  type    = string
  default = "cmc-prod-postgres"
}

variable "postgres_server_image_name" {
  type    = string
  default = "ubuntu-24.04-base"
}

variable "postgres_server_hypervisor_type" {
  type    = string
  default = "KVM"
}

variable "postgres_server_spec_code" {
  description = "PostgreSQL VM spec code. Set this to the NCP micro/basic spec code for prod."
  type        = string
}

variable "postgres_fee_system_type_code" {
  description = "NCP fee system type code for the PostgreSQL VM. mi1-g3 micro servers require FXSUM."
  type        = string
  default     = "FXSUM"
}

variable "postgres_server_init_script" {
  description = "Optional bootstrap script for the private PostgreSQL VM. Avoid placing DB passwords here because init script content is stored in Terraform state."
  type        = string
  default     = ""
}

variable "postgres_protect_server_termination" {
  type    = bool
  default = true
}

variable "redis_mode" {
  type    = string
  default = "container"
}

variable "redis_product_code" {
  type     = string
  default  = null
  nullable = true
}

variable "redis_engine_version_code" {
  type     = string
  default  = null
  nullable = true
}

variable "redis_version" {
  type    = string
  default = "7.0.13-simple"
}

variable "redis_ha" {
  type    = bool
  default = false
}

variable "redis_backup" {
  type    = bool
  default = false
}

variable "observability_mode" {
  type    = string
  default = "docker-compose"
}
