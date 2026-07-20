output "workload_identity_provider_name" {
  description = "Full Workload Identity Provider resource name for google-github-actions/auth."
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "service_account_email" {
  description = "GitHub Actions deployer service account email."
  value       = google_service_account.deployer.email
}

output "service_account_member" {
  description = "IAM member string for resource-scoped deployment roles."
  value       = "serviceAccount:${google_service_account.deployer.email}"
}

output "attribute_condition" {
  description = "OIDC attribute condition enforced by the provider."
  value       = google_iam_workload_identity_pool_provider.github.attribute_condition
}
