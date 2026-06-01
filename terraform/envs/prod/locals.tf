locals {
  environment = "prod"

  common_tags = {
    owner       = var.owner
    cost_center = var.cost_center
    service     = var.project
  }

  postgresql_private_inbound_rules = [
    {
      protocol    = "TCP"
      ip_block    = var.public_subnet_cidr
      port_range  = "5432"
      description = "postgresql-from-backend-subnet"
    },
    {
      protocol    = "TCP"
      ip_block    = var.public_subnet_cidr
      port_range  = "22"
      description = "ssh-from-backend-subnet"
    }
  ]
}
