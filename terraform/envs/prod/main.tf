module "frontend_labels" {
  source = "../../modules/labels"

  project     = var.project
  environment = local.environment
  component   = "frontend"
  extra_tags  = local.common_tags
}

module "frontend_storage" {
  source = "../../modules/object_storage_frontend"

  project              = var.project
  environment          = local.environment
  bucket_name          = var.frontend_bucket_name
  service_domain       = "${var.frontend_subdomain}.${var.root_domain}"
  asset_prefix         = var.frontend_asset_prefix
  enable_versioning    = true
  cors_allowed_origins = ["https://${var.frontend_subdomain}.${var.root_domain}"]
  tags                 = module.frontend_labels.tags
}

module "network" {
  source = "../../modules/network"

  project                 = var.project
  environment             = local.environment
  vpc_name                = "${var.project}-${local.environment}-vpc"
  vpc_cidr                = var.vpc_cidr
  zone                    = var.zone
  public_subnet_name      = "${var.project}-${local.environment}-public-subnet"
  private_subnet_name     = "${var.project}-${local.environment}-private-subnet"
  public_subnet_cidr      = var.public_subnet_cidr
  private_subnet_cidr     = var.private_subnet_cidr
  create_nat_gateway      = true
  nat_subnet_name         = var.nat_subnet_name
  nat_subnet_cidr         = var.nat_subnet_cidr
  nat_gateway_name        = var.nat_gateway_name
  nat_gateway_description = "Outbound internet access for ${var.project}-${local.environment} private subnet"
  ssh_access_cidrs        = var.ssh_access_cidrs
  public_access_cidrs     = var.public_access_cidrs
  extra_inbound_rules     = concat(var.extra_public_inbound_rules, local.postgresql_private_inbound_rules)
  tags                    = local.common_tags
}

module "backend_labels" {
  source = "../../modules/labels"

  project     = var.project
  environment = local.environment
  component   = "backend"
  extra_tags  = local.common_tags
}

module "backend_server" {
  source = "../../modules/backend_server"

  project                = var.project
  environment            = local.environment
  name                   = "${var.project}-${local.environment}-api"
  server_image_name      = var.server_image_name
  server_hypervisor_type = var.server_hypervisor_type
  server_spec_code       = var.server_spec_code
  subnet_no              = module.network.public_subnet_no
  login_key_name         = var.login_key_name
  associate_public_ip    = true
  init_script            = var.server_init_script
  description            = "CMC prod nginx + backend node"
  tags                   = module.backend_labels.tags
}

module "postgresql_labels" {
  source = "../../modules/labels"

  project     = var.project
  environment = local.environment
  component   = "postgresql"
  extra_tags  = local.common_tags
}

module "postgresql_server" {
  source = "../../modules/backend_server"

  project                       = var.project
  environment                   = local.environment
  name                          = var.postgres_server_name
  description                   = "CMC prod PostgreSQL node"
  public_ip_description         = null
  server_image_name             = var.postgres_server_image_name
  server_hypervisor_type        = var.postgres_server_hypervisor_type
  server_spec_code              = var.postgres_server_spec_code
  fee_system_type_code          = var.postgres_fee_system_type_code
  subnet_no                     = module.network.private_subnet_no
  login_key_name                = var.login_key_name
  associate_public_ip           = false
  init_script                   = var.postgres_server_init_script
  is_protect_server_termination = var.postgres_protect_server_termination
  tags                          = module.postgresql_labels.tags
}

module "redis_cache" {
  source = "../../modules/redis_cache"

  project             = var.project
  environment         = local.environment
  name                = "${var.project}-${local.environment}-redis"
  mode                = var.redis_mode
  vpc_no              = module.network.vpc_no
  subnet_no           = module.network.private_subnet_no
  subnet_name         = module.network.private_subnet_name
  product_code        = var.redis_product_code
  engine_version_code = var.redis_engine_version_code
  redis_version       = var.redis_version
  is_ha               = var.redis_ha
  is_backup           = var.redis_backup
  tags                = local.common_tags
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

