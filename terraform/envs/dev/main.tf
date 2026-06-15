module "backend_labels" {
  source = "../../modules/labels"

  project     = var.project
  environment = local.environment
  component   = "backend"
  extra_tags  = local.common_tags
}

module "network" {
  source = "../../modules/network"

  project                  = var.project
  environment              = local.environment
  vpc_name                 = var.vpc_name
  vpc_cidr                 = var.vpc_cidr
  zone                     = var.zone
  public_subnet_name       = var.public_subnet_name
  private_subnet_name      = null
  public_subnet_cidr       = var.public_subnet_cidr
  private_subnet_cidr      = "10.255.255.0/24"
  create_private_subnet    = false
  ssh_access_cidrs         = var.ssh_access_cidrs
  public_access_cidrs      = var.public_access_cidrs
  extra_inbound_rules      = var.extra_public_inbound_rules
  manage_default_acg_rules = true
  tags                     = local.common_tags
}

module "backend_server" {
  source = "../../modules/backend_server"

  project                       = var.project
  environment                   = local.environment
  name                          = var.server_name
  description                   = var.server_description
  public_ip_description         = var.public_ip_description
  server_image_name             = var.server_image_name
  server_hypervisor_type        = var.server_hypervisor_type
  server_spec_code              = var.server_spec_code
  subnet_no                     = module.network.public_subnet_no
  login_key_name                = var.login_key_name
  associate_public_ip           = true
  init_script                   = local.effective_server_init_script
  is_protect_server_termination = var.is_protect_server_termination
  tags                          = module.backend_labels.tags
}

module "observability" {
  source = "../../modules/observability"

  project     = var.project
  environment = local.environment
  name        = "${var.project}-${local.environment}-observability"
  mode        = var.observability_mode
  subnet_name = module.network.public_subnet_name
  components  = ["prometheus", "grafana", "cadvisor"]
  tags        = local.common_tags
}
