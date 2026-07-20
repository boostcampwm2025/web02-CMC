locals {
  zone_name = var.create_zone ? google_dns_managed_zone.this[0].name : var.managed_zone_name
}

resource "google_dns_managed_zone" "this" {
  count = var.create_zone ? 1 : 0

  project     = var.project_id
  name        = var.managed_zone_name
  dns_name    = var.dns_name
  description = "Managed zone for ${var.dns_name}"
  labels      = var.labels
}

resource "google_dns_record_set" "frontend" {
  count = var.create_records ? 1 : 0

  project      = var.project_id
  managed_zone = local.zone_name
  name         = "${var.frontend_domain}."
  type         = "A"
  ttl          = var.ttl
  rrdatas      = [var.load_balancer_ip]
}

resource "google_dns_record_set" "api" {
  count = var.create_records ? 1 : 0

  project      = var.project_id
  managed_zone = local.zone_name
  name         = "${var.api_domain}."
  type         = "A"
  ttl          = var.ttl
  rrdatas      = [var.load_balancer_ip]
}
