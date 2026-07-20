resource "google_project_service" "required" {
  for_each = toset(local.required_services)

  project            = var.gcp_project_id
  service            = each.value
  disable_on_destroy = false
}

module "network" {
  source = "../../modules/gcp_network"

  project_id                    = var.gcp_project_id
  name_prefix                   = local.name_prefix
  region                        = var.region
  network_name                  = "${local.name_prefix}-vpc"
  subnet_name                   = "${local.name_prefix}-backend-subnet"
  subnet_cidr                   = var.backend_subnet_cidr
  enable_cloud_nat              = var.enable_cloud_nat
  enable_private_service_access = true
  backend_target_tags           = local.backend_network_tags
  backend_http_ports            = ["80"]
  admin_access_cidrs            = var.admin_access_cidrs
  admin_tcp_ports               = var.admin_tcp_ports
  labels                        = local.common_labels

  depends_on = [google_project_service.required]
}

module "frontend_storage" {
  source = "../../modules/gcp_frontend_storage"

  project_id    = var.gcp_project_id
  bucket_name   = var.frontend_bucket_name
  location      = var.frontend_bucket_location
  force_destroy = var.frontend_force_destroy
  public_read   = true
  upload_members = [
    module.github_actions_identity.service_account_member,
  ]
  labels = local.common_labels

  depends_on = [google_project_service.required]
}

module "backend_compute" {
  source = "../../modules/gcp_compute_backend"

  project_id                    = var.gcp_project_id
  name                          = "${local.name_prefix}-backend"
  region                        = var.region
  machine_type                  = var.backend_machine_type
  source_image                  = var.backend_source_image
  boot_disk_size_gb             = var.backend_boot_disk_size_gb
  subnetwork_self_link          = module.network.subnet_self_link
  network_tags                  = local.backend_network_tags
  assign_public_ip              = var.backend_assign_public_ip
  service_account_id            = "${local.name_prefix}-backend"
  service_account_display_name  = "CMC ${local.environment} backend VM"
  service_account_roles         = var.backend_service_account_roles
  target_size                   = var.backend_target_size
  backend_port_name             = "http"
  backend_port                  = 80
  autohealing_enabled           = var.backend_autohealing_enabled
  autohealing_initial_delay_sec = var.backend_autohealing_initial_delay_sec
  startup_script                = var.backend_startup_script
  labels                        = local.common_labels

  depends_on = [module.network]
}

module "github_actions_identity" {
  source = "../../modules/gcp_github_actions_identity"

  project_id                   = var.gcp_project_id
  environment                  = local.environment
  pool_id                      = "${local.name_prefix}-github"
  pool_display_name            = "CMC ${local.environment} GitHub"
  provider_id                  = "github"
  service_account_id           = "${local.name_prefix}-deployer"
  service_account_display_name = "CMC ${local.environment} GitHub deployer"
  github_repository            = var.github_repository
  github_repository_id         = var.github_repository_id
  github_repository_owner_id   = var.github_repository_owner_id
  allowed_refs                 = ["refs/heads/release"]
  allow_version_tags           = false
  backend_service_account_emails = [
    module.backend_compute.service_account_email,
  ]

  depends_on = [google_project_service.required]
}

module "artifact_registry" {
  source = "../../modules/gcp_artifact_registry"

  project_id     = var.gcp_project_id
  location       = var.region
  repository_id  = var.artifact_registry_repository_id
  immutable_tags = true
  push_members = distinct(concat(
    var.artifact_registry_push_members,
    [module.github_actions_identity.service_account_member],
  ))
  pull_members = concat(
    var.artifact_registry_pull_members,
    ["serviceAccount:${module.backend_compute.service_account_email}"],
  )
  labels = local.common_labels

  depends_on = [google_project_service.required]
}

module "cloud_sql" {
  source = "../../modules/gcp_cloud_sql"

  project_id          = var.gcp_project_id
  name                = "${local.name_prefix}-postgres"
  region              = var.region
  database_version    = var.cloud_sql_database_version
  tier                = var.cloud_sql_tier
  edition             = var.cloud_sql_edition
  disk_size_gb        = var.cloud_sql_disk_size_gb
  private_network     = module.network.network_self_link
  database_name       = var.database_name
  deletion_protection = var.cloud_sql_deletion_protection
  labels              = local.common_labels

  depends_on = [module.network]
}

module "secret_manager" {
  source = "../../modules/gcp_secret_manager"

  project_id = var.gcp_project_id
  secret_ids = var.secret_ids
  accessor_members = [
    "serviceAccount:${module.backend_compute.service_account_email}",
  ]
  labels = local.common_labels

  depends_on = [google_project_service.required]
}

module "https_lb" {
  source = "../../modules/gcp_https_lb"

  project_id              = var.gcp_project_id
  name_prefix             = local.name_prefix
  frontend_bucket_name    = module.frontend_storage.bucket_name
  frontend_hosts          = [local.frontend_domain]
  api_hosts               = [local.api_domain]
  api_instance_group      = module.backend_compute.instance_group
  api_port_name           = "http"
  api_port                = 80
  health_check_path       = "/healthz"
  ssl_certificate_domains = distinct([local.frontend_domain, local.api_domain])
  enable_cdn              = true
  enable_http_redirect    = true
  labels                  = local.common_labels

  depends_on = [google_project_service.required]
}

module "dns" {
  source = "../../modules/gcp_dns"

  project_id        = var.gcp_project_id
  create_zone       = var.create_dns_zone
  create_records    = var.create_dns_records
  managed_zone_name = var.managed_zone_name
  dns_name          = "${var.root_domain}."
  frontend_domain   = local.frontend_domain
  api_domain        = local.api_domain
  load_balancer_ip  = module.https_lb.ip_address
  ttl               = var.dns_record_ttl
  labels            = local.common_labels

  depends_on = [google_project_service.required]
}
