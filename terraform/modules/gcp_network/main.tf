locals {
  load_balancer_source_ranges = [
    "35.191.0.0/16",
    "130.211.0.0/22",
  ]

  iap_tcp_forwarding_source_ranges = [
    "35.235.240.0/20",
  ]
}

resource "google_compute_network" "this" {
  project                 = var.project_id
  name                    = var.network_name
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
}

resource "google_compute_subnetwork" "backend" {
  project                  = var.project_id
  name                     = var.subnet_name
  region                   = var.region
  ip_cidr_range            = var.subnet_cidr
  network                  = google_compute_network.this.id
  private_ip_google_access = true
}

resource "google_compute_router" "this" {
  count = var.enable_cloud_nat ? 1 : 0

  project = var.project_id
  name    = "${var.name_prefix}-router"
  region  = var.region
  network = google_compute_network.this.id
}

resource "google_compute_router_nat" "this" {
  count = var.enable_cloud_nat ? 1 : 0

  project                            = var.project_id
  name                               = "${var.name_prefix}-nat"
  router                             = google_compute_router.this[0].name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "LIST_OF_SUBNETWORKS"

  subnetwork {
    name                    = google_compute_subnetwork.backend.id
    source_ip_ranges_to_nat = ["ALL_IP_RANGES"]
  }
}

resource "google_compute_global_address" "private_services" {
  count = var.enable_private_service_access ? 1 : 0

  project       = var.project_id
  name          = "${var.name_prefix}-private-services"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = var.private_service_access_prefix_length
  network       = google_compute_network.this.id
}

resource "google_service_networking_connection" "private_services" {
  count = var.enable_private_service_access ? 1 : 0

  network                 = google_compute_network.this.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_services[0].name]
}

resource "google_compute_firewall" "allow_iap_ssh" {
  project = var.project_id
  name    = "${var.name_prefix}-allow-iap-ssh"
  network = google_compute_network.this.name

  direction     = "INGRESS"
  source_ranges = local.iap_tcp_forwarding_source_ranges
  target_tags   = var.backend_target_tags

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
}

resource "google_compute_firewall" "allow_lb_to_backend" {
  project = var.project_id
  name    = "${var.name_prefix}-allow-lb-to-backend"
  network = google_compute_network.this.name

  direction     = "INGRESS"
  source_ranges = local.load_balancer_source_ranges
  target_tags   = var.backend_target_tags

  allow {
    protocol = "tcp"
    ports    = var.backend_http_ports
  }
}

resource "google_compute_firewall" "allow_admin_tcp" {
  count = length(var.admin_access_cidrs) > 0 ? 1 : 0

  project = var.project_id
  name    = "${var.name_prefix}-allow-admin-tcp"
  network = google_compute_network.this.name

  direction     = "INGRESS"
  source_ranges = var.admin_access_cidrs
  target_tags   = var.backend_target_tags

  allow {
    protocol = "tcp"
    ports    = var.admin_tcp_ports
  }
}
