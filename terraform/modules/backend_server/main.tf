locals {
  server_tags = merge(var.tags, {
    runtime = "docker-compose"
  })
}

data "ncloud_server_image_numbers" "this" {
  server_image_name = var.server_image_name

  filter {
    name   = "hypervisor_type"
    values = [var.server_hypervisor_type]
  }
}

data "ncloud_server_specs" "this" {
  filter {
    name   = "server_spec_code"
    values = [var.server_spec_code]
  }
}

resource "ncloud_init_script" "this" {
  count = trimspace(var.init_script) == "" ? 0 : 1

  name    = "${var.name}-init"
  content = var.init_script
}

resource "ncloud_server" "this" {
  subnet_no                     = var.subnet_no
  name                          = var.name
  description                   = var.description
  server_image_number           = data.ncloud_server_image_numbers.this.image_number_list[0].server_image_number
  server_spec_code              = data.ncloud_server_specs.this.server_spec_list[0].server_spec_code
  login_key_name                = var.login_key_name
  fee_system_type_code          = var.fee_system_type_code
  is_protect_server_termination = var.is_protect_server_termination
  init_script_no                = try(ncloud_init_script.this[0].id, null)
}

resource "ncloud_public_ip" "this" {
  count = var.associate_public_ip ? 1 : 0

  server_instance_no = ncloud_server.this.id
  description        = var.public_ip_description
}
