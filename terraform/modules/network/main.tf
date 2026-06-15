locals {
  network_tags = merge(var.tags, {
    network_scope = "application"
  })

  base_inbound_rules = concat(
    [
      for cidr in var.ssh_access_cidrs : {
        protocol    = "TCP"
        ip_block    = cidr
        port_range  = "22"
        description = "ssh"
      }
    ],
    flatten([
      for cidr in var.public_access_cidrs : [
        for port in ["80", "443"] : {
          protocol    = "TCP"
          ip_block    = cidr
          port_range  = port
          description = "public-web"
        }
      ]
    ])
  )

  inbound_rules = concat(local.base_inbound_rules, var.extra_inbound_rules)
}

resource "ncloud_vpc" "this" {
  name            = var.vpc_name
  ipv4_cidr_block = var.vpc_cidr
}

resource "ncloud_subnet" "public" {
  vpc_no         = ncloud_vpc.this.id
  subnet         = var.public_subnet_cidr
  zone           = var.zone
  network_acl_no = ncloud_vpc.this.default_network_acl_no
  subnet_type    = "PUBLIC"
  usage_type     = "GEN"
  name           = var.public_subnet_name
}

resource "ncloud_subnet" "private" {
  count = var.create_private_subnet ? 1 : 0

  vpc_no         = ncloud_vpc.this.id
  subnet         = var.private_subnet_cidr
  zone           = var.zone
  network_acl_no = ncloud_vpc.this.default_network_acl_no
  subnet_type    = "PRIVATE"
  usage_type     = "GEN"
  name           = var.private_subnet_name
}

resource "ncloud_access_control_group_rule" "default" {
  count = var.manage_default_acg_rules ? 1 : 0

  access_control_group_no = ncloud_vpc.this.default_access_control_group_no

  dynamic "inbound" {
    for_each = local.inbound_rules
    content {
      protocol    = inbound.value.protocol
      ip_block    = inbound.value.ip_block
      port_range  = inbound.value.port_range
      description = inbound.value.description
    }
  }

  outbound {
    protocol    = "TCP"
    ip_block    = "0.0.0.0/0"
    port_range  = "1-65535"
    description = "allow-all-tcp-egress"
  }

  outbound {
    protocol    = "UDP"
    ip_block    = "0.0.0.0/0"
    port_range  = "1-65535"
    description = "allow-all-udp-egress"
  }
}

resource "ncloud_subnet" "nat" {
  count = var.create_nat_gateway ? 1 : 0

  vpc_no         = ncloud_vpc.this.id
  subnet         = var.nat_subnet_cidr
  zone           = var.zone
  network_acl_no = ncloud_vpc.this.default_network_acl_no
  subnet_type    = "PUBLIC"
  usage_type     = "NATGW"
  name           = var.nat_subnet_name
}

resource "ncloud_nat_gateway" "this" {
  count = var.create_nat_gateway ? 1 : 0

  vpc_no      = ncloud_vpc.this.id
  subnet_no   = ncloud_subnet.nat[0].id
  zone        = var.zone
  name        = var.nat_gateway_name
  description = var.nat_gateway_description
}

resource "ncloud_route_table" "private_nat" {
  count = var.create_nat_gateway && var.create_private_subnet ? 1 : 0

  vpc_no                = ncloud_vpc.this.id
  supported_subnet_type = "PRIVATE"
  name                  = "${var.vpc_name}-private-nat-rt"
  description           = "Private subnet route table for NAT Gateway outbound access."
}

resource "ncloud_route" "private_nat_default" {
  count = var.create_nat_gateway && var.create_private_subnet ? 1 : 0

  route_table_no         = ncloud_route_table.private_nat[0].id
  destination_cidr_block = "0.0.0.0/0"
  target_type            = "NATGW"
  target_name            = ncloud_nat_gateway.this[0].name
  target_no              = ncloud_nat_gateway.this[0].id
}

resource "ncloud_route_table_association" "private_nat" {
  count = var.create_nat_gateway && var.create_private_subnet ? 1 : 0

  route_table_no = ncloud_route_table.private_nat[0].id
  subnet_no      = ncloud_subnet.private[0].id
}

