output "frontend_domain" {
  description = "Frontend domain."
  value       = local.frontend_domain
}

output "api_domain" {
  description = "API domain."
  value       = local.api_domain
}

output "load_balancer_ip" {
  description = "Global HTTPS load balancer IP."
  value       = module.https_lb.ip_address
}

output "frontend_bucket_name" {
  description = "Frontend Cloud Storage bucket name."
  value       = module.frontend_storage.bucket_name
}

output "artifact_registry_docker_repository_url" {
  description = "Artifact Registry Docker repository URL prefix."
  value       = module.artifact_registry.docker_repository_url
}

output "backend_service_account_email" {
  description = "Backend VM service account email."
  value       = module.backend_compute.service_account_email
}

output "backend_instance_group_manager_name" {
  description = "Backend MIG name used by deployment automation."
  value       = module.backend_compute.instance_group_manager_name
}

output "github_workload_identity_provider" {
  description = "Workload Identity Provider used by GitHub Actions."
  value       = module.github_actions_identity.workload_identity_provider_name
}

output "github_deployer_service_account_email" {
  description = "Keyless GitHub Actions deployer service account email."
  value       = module.github_actions_identity.service_account_email
}

output "cloud_sql_private_ip" {
  description = "Cloud SQL private IP."
  value       = module.cloud_sql.private_ip_address
}

output "cloud_sql_connection_name" {
  description = "Cloud SQL connection name."
  value       = module.cloud_sql.connection_name
}

output "dns_name_servers" {
  description = "Name servers for the created DNS zone. Delegate the domain to these nameservers when create_dns_zone is true."
  value       = module.dns.name_servers
}
