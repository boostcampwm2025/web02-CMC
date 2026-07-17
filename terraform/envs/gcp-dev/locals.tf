locals {
  environment = "dev"
  name_prefix = "${var.project}-${local.environment}"

  frontend_domain = var.frontend_subdomain == "" ? var.root_domain : "${var.frontend_subdomain}.${var.root_domain}"
  api_domain      = "${var.api_subdomain}.${var.root_domain}"

  backend_network_tags = ["${local.name_prefix}-backend"]

  required_services = [
    "artifactregistry.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "compute.googleapis.com",
    "dns.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "iap.googleapis.com",
    "secretmanager.googleapis.com",
    "servicenetworking.googleapis.com",
    "serviceusage.googleapis.com",
    "sqladmin.googleapis.com",
    "storage.googleapis.com",
  ]

  common_labels = {
    project     = var.project
    environment = local.environment
    managed_by  = "terraform"
    owner       = var.owner
    cost_center = var.cost_center
  }
}
