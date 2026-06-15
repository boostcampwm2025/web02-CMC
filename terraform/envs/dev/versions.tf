terraform {
  required_version = ">= 1.6.0"

  required_providers {
    ncloud = {
      source  = "navercloudplatform/ncloud"
      version = "~> 4.0"
    }
  }
}
