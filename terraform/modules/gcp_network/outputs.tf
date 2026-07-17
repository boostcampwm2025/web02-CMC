output "network_id" {
  description = "VPC network ID."
  value       = google_compute_network.this.id
}

output "network_name" {
  description = "VPC network name."
  value       = google_compute_network.this.name
}

output "network_self_link" {
  description = "VPC network self link."
  value       = google_compute_network.this.self_link
}

output "subnet_id" {
  description = "Backend subnet ID."
  value       = google_compute_subnetwork.backend.id
}

output "subnet_name" {
  description = "Backend subnet name."
  value       = google_compute_subnetwork.backend.name
}

output "subnet_self_link" {
  description = "Backend subnet self link."
  value       = google_compute_subnetwork.backend.self_link
}

output "private_service_connection_id" {
  description = "Service Networking connection ID for private services."
  value       = try(google_service_networking_connection.private_services[0].id, null)
}
