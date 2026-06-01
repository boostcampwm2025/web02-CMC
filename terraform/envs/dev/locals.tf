locals {
  environment = "dev"

  common_tags = {
    owner       = var.owner
    cost_center = var.cost_center
    service     = var.project
  }

  default_server_init_script = <<-EOT
    #!/bin/bash
    set -euxo pipefail

    export DEBIAN_FRONTEND=noninteractive

    apt-get update
    apt-get install -y ca-certificates curl git gnupg

    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc

    . /etc/os-release
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list

    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    systemctl enable --now docker
    usermod -aG docker ubuntu || true

    mkdir -p /opt/cmc
    chown ubuntu:ubuntu /opt/cmc || true
  EOT

  effective_server_init_script = var.server_init_script == null ? local.default_server_init_script : var.server_init_script
}
