output "bucket_name" {
  description = "Cloud Storage bucket name."
  value       = google_storage_bucket.this.name
}

output "bucket_url" {
  description = "Cloud Storage bucket URL."
  value       = google_storage_bucket.this.url
}

output "self_link" {
  description = "Cloud Storage bucket self link."
  value       = google_storage_bucket.this.self_link
}
