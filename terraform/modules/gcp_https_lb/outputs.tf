output "ip_address" {
  description = "Global load balancer IPv4 address."
  value       = google_compute_global_address.this.address
}

output "https_forwarding_rule" {
  description = "HTTPS global forwarding rule self link."
  value       = google_compute_global_forwarding_rule.https.self_link
}

output "url_map_id" {
  description = "HTTPS URL map ID."
  value       = google_compute_url_map.this.id
}

output "managed_ssl_certificate_id" {
  description = "Google-managed SSL certificate ID."
  value       = google_compute_managed_ssl_certificate.this.id
}

output "frontend_backend_bucket_id" {
  description = "Frontend backend bucket ID."
  value       = google_compute_backend_bucket.frontend.id
}

output "api_backend_service_id" {
  description = "API backend service ID."
  value       = google_compute_backend_service.api.id
}
