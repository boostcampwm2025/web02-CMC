output "frontend_bucket_name" {
  value = module.frontend_storage.bucket_name
}

output "frontend_domain" {
  value = "${var.frontend_subdomain}.${var.root_domain}"
}

output "api_domain" {
  value = "${var.api_subdomain}.${var.root_domain}"
}


output "nat_gateway_public_ip" {
  value = module.network.nat_gateway_public_ip
}

output "nat_gateway_no" {
  value = module.network.nat_gateway_no
}

output "backend_server_name" {
  value = module.backend_server.name
}

output "backend_public_ip" {
  value = module.backend_server.public_ip
}

output "backend_private_ip" {
  value = module.backend_server.private_ip
}

output "postgres_server_name" {
  value = module.postgresql_server.name
}

output "postgres_server_id" {
  value = module.postgresql_server.server_id
}

output "postgres_private_ip" {
  value = module.postgresql_server.private_ip
}

output "redis_name" {
  value = module.redis_cache.name
}

output "observability_name" {
  value = module.observability.name
}
