---
title: How to Setup GitLab Runner with Cross-Platform Docker Enabled
date: 2023-12-04
tags: [How-to, GitLab, Docker]
---

In this how-to, we will setup a GitLab Runner with Docker cross-platform build enabled inside the job container. Debian is used as example, but the steps should be similar for other Linux distributions.

## 1. Install Docker

Follow the [Docker docs](https://docs.docker.com/engine/install/) to install Docker Engine.

For Debian, the following commands summarize the steps.

```sh
# optional: uninstall old installation
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done

# set up apt repository
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# install docker engine
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# configure docker daemon
sudo systemctl enable docker.service
sudo systemctl enable containerd.service
```

## 2. Register GitLab Runner

GitLab Runner can be run as a Docker service. The following command pulls the latest image.

```sh
docker pull gitlab/gitlab-runner:latest
```

Usually all you need to do is to modify the configuration under `/etc/gitlab-runner/`. GitLab Runner provides a command `register` to setup some basic configurations. The [official docs](https://docs.gitlab.com/runner/register/?tab=Docker) provides details of this command. For a simple setup, we can use the following command to start a short-lived container.

```sh
docker run --rm -v /srv/gitlab-runner/config:/etc/gitlab-runner gitlab/gitlab-runner register \
  --non-interactive \
  --url "https://gitlab.com/" \
  --token "$RUNNER_TOKEN" \
  --executor "docker" \
  --docker-image alpine:latest \
  --description "docker-runner"
```

- `url`: GitLab URL, can be found in the GitLab project settings.
- `token`: GitLab authentication token, can be found in the GitLab project settings.
- `executor`: Job dispatch mode, for this how-to we use `docker`.
- `docker-image`: Default Docker image used to run the job.

Now a simple configuration is generated in `/srv/gitlab-runner/config/config.toml` of the host. We can start the GitLab Runner service with this configuration. The following commands cover the most common operations.

- start service
  ```sh
  docker run -d --name gitlab-runner --restart always \
    -v /srv/gitlab-runner/config:/etc/gitlab-runner \
    -v /var/run/docker.sock:/var/run/docker.sock \
    gitlab/gitlab-runner:latest
  ```
  Notice that we mount `/var/run/docker.sock` of the host to the container so that GitLab Runner can dispatch jobs to Docker containers.
- restart service
  ```sh
  docker restart gitlab-runner
  ```
- fetch the logs
  ```sh
  docker logs gitlab-runner
  ```
- stop service
  ```sh
  docker stop gitlab-runner
  ```

So far we have setup a GitLab Runner which can be used by GitLab CI/CD. For most common use cases, we can stop here. However, after this setup, jobs are run in the container. That means we cannot build Docker image in the job (a Docker in Docker scenario). In the following sections, we will enable Docker in the job container.

## 3. Enable Docker in Docker

A straightforward appraoch is to start a Docker Engine inside the container. [`docker:dind`](https://hub.docker.com/_/docker) image provides this ability. However _running Docker inside Docker is generally not recommended_. Another possible approach is to connect Docker Engine of the host to the job container.

Generally Docker CLI connects to Docker Engine via unix sock `/var/run/docker.sock`. We can mount this file to the job container as we do for the GitLab Runner above. Add the folloing section to the configuration `/srv/gitlab-runner/config/config.toml`.

```toml
[[runners]]
  # the runner added before
  [runners.docker]
    volumes = ["/var/run/docker.sock:/var/run/docker.sock"]
```

Now we have `/var/run/docker.sock` for each job container. Next we need to install Docker CLI in each job container. We could add extra install steps in `before_script` of jobs that require Docker. We could also create a custom Docker image with Docker CLI installed. The following Dockerfile is an example with Debian as base image.

```dockerfile
FROM debian:bullseye

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y git ca-certificates curl gnupg

RUN install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
    && chmod a+r /etc/apt/keyrings/docker.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

RUN apt-get update

RUN apt-get install -y docker-ce-cli

ENV DOCKER_HOST unix:///var/run/docker.sock
```

Most steps are the same as [we did for the host](#1-install-docker), but here we only install `docker-ce-cli` instead of complete Docker installation. Then we build the image, name it `debian-ci-base`, and use it as the default image for job.

```toml
[[runners]]
  # the runner added before
  [runners.docker]
    volumes = ["/var/run/docker.sock:/var/run/docker.sock"]
    image = "debian-ci-base"
```

So far, our GitLab Runner is able to run CI with Docker. Some specific jobs require multi-platform, e.g. build a Docker image for both `amd64` and `arm64`. This could be done via setup multiple GitLab Runner in different platforms. We could also achieve this within one single platform. The following section introduces how to support cross-platform by `buildx`.

## 4. Support Cross-Platform

_`buildx` is a Docker CLI plugin for extended build capabilities._ With `buildx`, we can set the `--platform` flag to specify the target platform for the build output. The following commands compare the usage of common `docker build` and `buildx`.

```sh
docker build [build-flags] .

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  [build-flags] \
  .
```

To enable cross-platform build, we need to setup buildx in the host Docker Engine. [tonistiigi/binfmt](https://github.com/tonistiigi/binfmt) is a docker image that has side-effect to set up buildx cross-platform emulator. We can run this image to setup buildx.

```sh
docker run --privileged --rm tonistiigi/binfmt --install all
```

After installation, we can inspect the buildx configuration.

```sh
> docker buildx inspect --bootstrap
Name:          default
Driver:        docker
Last Activity: 2023-12-01 10:46:17 +0000 UTC

Nodes:
Name:      default
Endpoint:  default
Status:    running
Buildkit:  v0.11.7+d3e6c1360f6e
Platforms: linux/amd64, linux/amd64/v2, linux/amd64/v3, linux/amd64/v4, linux/386, linux/arm64, linux/riscv64, linux/ppc64, linux/ppc64le, linux/s390x, linux/mips64le, linux/mips64, linux/arm/v7, linux/arm/v6
```

The `Platforms` section lists all supported platforms. Now we can use `buildx` to build multi-platform Docker image.
