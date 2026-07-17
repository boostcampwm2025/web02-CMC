locals {
  ssl_certificate_name = "${var.name_prefix}-cert-${substr(sha1(join(",", sort(var.ssl_certificate_domains))), 0, 8)}"
}

resource "google_compute_global_address" "this" {
  project = var.project_id
  name    = "${var.name_prefix}-lb-ip"
  labels  = var.labels
}

resource "google_compute_backend_bucket" "frontend" {
  project     = var.project_id
  name        = "${var.name_prefix}-frontend"
  bucket_name = var.frontend_bucket_name
  enable_cdn  = var.enable_cdn
}

resource "google_compute_health_check" "api" {
  project = var.project_id
  name    = "${var.name_prefix}-api-health"

  check_interval_sec  = 10
  timeout_sec         = 5
  healthy_threshold   = 2
  unhealthy_threshold = 3

  http_health_check {
    port         = var.api_port
    request_path = var.health_check_path
  }
}

resource "google_compute_backend_service" "api" {
  project                = var.project_id
  name                   = "${var.name_prefix}-api"
  protocol               = "HTTP"
  port_name              = var.api_port_name
  timeout_sec            = var.backend_timeout_sec
  custom_request_headers = ["${var.client_ip_header_name}:{client_ip_address}"]
  health_checks = [
    google_compute_health_check.api.id,
  ]

  backend {
    group = var.api_instance_group
  }
}

resource "google_compute_url_map" "this" {
  project         = var.project_id
  name            = "${var.name_prefix}-https"
  default_service = google_compute_backend_bucket.frontend.id

  host_rule {
    hosts        = var.frontend_hosts
    path_matcher = "frontend"
  }

  path_matcher {
    name            = "frontend"
    default_service = google_compute_backend_bucket.frontend.id
  }

  host_rule {
    hosts        = var.api_hosts
    path_matcher = "api"
  }

  path_matcher {
    name            = "api"
    default_service = google_compute_backend_service.api.id

    path_rule {
      paths = [
        "/api",
        "/api/*",
        "/socket.io",
        "/socket.io/*",
      ]
      service = google_compute_backend_service.api.id
    }
  }
}

resource "google_compute_managed_ssl_certificate" "this" {
  project = var.project_id
  name    = local.ssl_certificate_name

  managed {
    domains = var.ssl_certificate_domains
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "google_compute_target_https_proxy" "this" {
  project          = var.project_id
  name             = "${var.name_prefix}-https-proxy"
  url_map          = google_compute_url_map.this.id
  ssl_certificates = [google_compute_managed_ssl_certificate.this.id]
}

resource "google_compute_global_forwarding_rule" "https" {
  project    = var.project_id
  name       = "${var.name_prefix}-https"
  target     = google_compute_target_https_proxy.this.id
  ip_address = google_compute_global_address.this.address
  port_range = "443"
}

resource "google_compute_url_map" "http_redirect" {
  count = var.enable_http_redirect ? 1 : 0

  project = var.project_id
  name    = "${var.name_prefix}-http-redirect"

  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_target_http_proxy" "http_redirect" {
  count = var.enable_http_redirect ? 1 : 0

  project = var.project_id
  name    = "${var.name_prefix}-http-proxy"
  url_map = google_compute_url_map.http_redirect[0].id
}

resource "google_compute_global_forwarding_rule" "http" {
  count = var.enable_http_redirect ? 1 : 0

  project    = var.project_id
  name       = "${var.name_prefix}-http"
  target     = google_compute_target_http_proxy.http_redirect[0].id
  ip_address = google_compute_global_address.this.address
  port_range = "80"
}
