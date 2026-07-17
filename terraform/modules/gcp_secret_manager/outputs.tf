output "secret_ids" {
  description = "Created Secret Manager secret IDs."
  value       = [for secret in google_secret_manager_secret.this : secret.secret_id]
}

output "secret_names" {
  description = "Created Secret Manager resource names."
  value       = [for secret in google_secret_manager_secret.this : secret.name]
}
