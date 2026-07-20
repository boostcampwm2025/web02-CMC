output "managed_zone_name" {
  description = "Cloud DNS managed zone name."
  value       = local.zone_name
}

output "name_servers" {
  description = "Name servers for the created managed zone."
  value       = try(google_dns_managed_zone.this[0].name_servers, [])
}

output "frontend_record_name" {
  description = "Frontend A record name."
  value       = try(google_dns_record_set.frontend[0].name, null)
}

output "api_record_name" {
  description = "API A record name."
  value       = try(google_dns_record_set.api[0].name, null)
}
