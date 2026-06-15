output "vpc_name" {
  value = var.vpc_name
}

output "vpc_no" {
  value = ncloud_vpc.this.id
}

output "public_subnet_cidr" {
  value = var.public_subnet_cidr
}

output "private_subnet_cidr" {
  value = var.private_subnet_cidr
}

output "public_subnet_no" {
  value = ncloud_subnet.public.id
}

output "private_subnet_no" {
  value = try(ncloud_subnet.private[0].id, null)
}

output "public_subnet_name" {
  value = ncloud_subnet.public.name
}

output "private_subnet_name" {
  value = try(ncloud_subnet.private[0].name, null)
}

output "default_access_control_group_no" {
  value = ncloud_vpc.this.default_access_control_group_no
}

output "tags" {
  value = local.network_tags
}

output "nat_subnet_no" {
  value = try(ncloud_subnet.nat[0].id, null)
}

output "nat_gateway_no" {
  value = try(ncloud_nat_gateway.this[0].id, null)
}

output "nat_gateway_public_ip" {
  value = try(ncloud_nat_gateway.this[0].public_ip, null)
}

output "private_route_table_no" {
  value = try(ncloud_route_table.private_nat[0].id, null)
}

