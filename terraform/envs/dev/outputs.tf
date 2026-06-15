output "vpc_name" {
  value = module.network.vpc_name
}

output "vpc_no" {
  value = module.network.vpc_no
}

output "public_subnet_name" {
  value = module.network.public_subnet_name
}

output "public_subnet_no" {
  value = module.network.public_subnet_no
}

output "backend_server_name" {
  value = module.backend_server.name
}

output "backend_server_id" {
  value = module.backend_server.server_id
}

output "backend_public_ip" {
  value = module.backend_server.public_ip
}

output "backend_public_ip_instance_no" {
  value = module.backend_server.public_ip_instance_no
}

output "backend_private_ip" {
  value = module.backend_server.private_ip
}

output "observability_name" {
  value = module.observability.name
}
