locals {
  boot_disk_device_name = "${var.name}-boot"

  default_startup_script = <<-EOT
    #!/bin/bash
    set -euxo pipefail

    export DEBIAN_FRONTEND=noninteractive

    apt-get update
    apt-get install -y ca-certificates curl gnupg git

    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc

    . /etc/os-release
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list

    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    mkdir -p /opt/cmc
    systemctl enable --now docker
  EOT

  startup_script = var.startup_script != "" ? var.startup_script : local.default_startup_script
}

resource "google_service_account" "this" {
  project      = var.project_id
  account_id   = var.service_account_id
  display_name = var.service_account_display_name
}

resource "google_project_iam_member" "service_account_roles" {
  for_each = toset(var.service_account_roles)

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.this.email}"
}

resource "google_compute_instance_template" "this" {
  project      = var.project_id
  name_prefix  = "${var.name}-"
  machine_type = var.machine_type
  tags         = var.network_tags
  labels       = var.labels

  metadata = merge(
    var.metadata,
    {
      enable-oslogin = "TRUE"
      startup-script = local.startup_script
    },
  )

  disk {
    boot         = true
    auto_delete  = false
    device_name  = local.boot_disk_device_name
    disk_size_gb = var.boot_disk_size_gb
    disk_type    = var.boot_disk_type
    source_image = var.source_image
  }

  network_interface {
    subnetwork = var.subnetwork_self_link

    dynamic "access_config" {
      for_each = var.assign_public_ip ? [1] : []
      content {}
    }
  }

  service_account {
    email  = google_service_account.this.email
    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "google_compute_health_check" "autohealing" {
  project = var.project_id
  name    = "${var.name}-autohealing"

  check_interval_sec  = 30
  timeout_sec         = 10
  healthy_threshold   = 2
  unhealthy_threshold = 3

  http_health_check {
    port         = var.backend_port
    request_path = "/livez"
  }

  log_config {
    enable = true
  }
}

resource "google_compute_region_instance_group_manager" "this" {
  project            = var.project_id
  name               = var.name
  region             = var.region
  base_instance_name = var.name
  target_size        = var.target_size

  version {
    instance_template = google_compute_instance_template.this.self_link
  }

  named_port {
    name = var.backend_port_name
    port = var.backend_port
  }

  stateful_disk {
    device_name = local.boot_disk_device_name
    delete_rule = "NEVER"
  }

  dynamic "auto_healing_policies" {
    for_each = var.autohealing_enabled ? [google_compute_health_check.autohealing.id] : []

    content {
      health_check      = auto_healing_policies.value
      initial_delay_sec = var.autohealing_initial_delay_sec
    }
  }

  update_policy {
    type                         = "OPPORTUNISTIC"
    minimal_action               = "REPLACE"
    replacement_method           = "RECREATE"
    instance_redistribution_type = "NONE"
    max_surge_fixed              = 0
  }
}
