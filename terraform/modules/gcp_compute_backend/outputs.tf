output "service_account_email" {
  description = "Backend VM service account email."
  value       = google_service_account.this.email
}

output "instance_template_self_link" {
  description = "Backend instance template self link."
  value       = google_compute_instance_template.this.self_link
}

output "instance_group_manager_self_link" {
  description = "Regional managed instance group manager self link."
  value       = google_compute_region_instance_group_manager.this.self_link
}

output "instance_group_manager_name" {
  description = "Regional managed instance group manager name used by deployment automation."
  value       = google_compute_region_instance_group_manager.this.name
}

output "instance_group" {
  description = "Regional managed instance group self link used by backend services."
  value       = google_compute_region_instance_group_manager.this.instance_group
}

output "autohealing_health_check_self_link" {
  description = "Health check used by the MIG autohealing policy."
  value       = google_compute_health_check.autohealing.self_link
}

output "stateful_boot_disk_device_name" {
  description = "Device name preserved by the stateful MIG policy."
  value       = local.boot_disk_device_name
}
