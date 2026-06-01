output "name" {
  value = var.name
}

output "server_image_name" {
  value = var.server_image_name
}

output "server_spec_code" {
  value = ncloud_server.this.server_spec_code
}

output "server_id" {
  value = ncloud_server.this.id
}

output "private_ip" {
  value = ncloud_server.this.private_ip
}

output "public_ip" {
  value = try(ncloud_public_ip.this[0].public_ip, ncloud_server.this.public_ip)
}

output "public_ip_instance_no" {
  value = try(ncloud_public_ip.this[0].id, null)
}

output "tags" {
  value = local.server_tags
}
