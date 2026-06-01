output "bucket_name" {
  description = "Bucket that stores frontend artifacts."
  value       = ncloud_objectstorage_bucket.this.bucket_name
}

output "bucket_id" {
  description = "Bucket identifier."
  value       = ncloud_objectstorage_bucket.this.id
}

output "asset_prefix" {
  description = "Upload prefix used by CI."
  value       = var.asset_prefix
}

output "service_domain" {
  description = "Frontend service domain."
  value       = var.service_domain
}

output "tags" {
  description = "Normalized labels for storage resources."
  value       = local.bucket_labels
}
