---
title: eBPF 内核功能及其应用
date: 2022-12-23
tags: [eBPF]
---

## 一、概述

BPF 最早被提出于 《The BSD Packet Filter: A New Architecture for User-level Packet Capture》，最初是用来作为网络模块的拓展。在 Linux Kernel 3.12 中，加入了拓展 BPF（the extended Berkeley Packet Filter，eBPF）的功能，将网络模块拓展到了整个内核。

## 二、The BSD Packet Filter（BPF）

S. McCanne 和 V. Jacobson 于 1992 年首次提出了 BPF 的网络模块。这个模块改进了此前网络模块的性能问题，提出了用一个有限编程模型将用户代码注册到内核中执行，减少内核态与用户态转换的开销。

BPF 有两个主要组件：网络分流器（The Network Tap）和数据包过滤器（The Package Filter）。

网络分流器建立在数据连接层（Data Link Layer）上。网络中的数据包到达时，触发内核中断，中断程序首先调用网络分流器，然后再交给上层协议（常见的是 IP 协议）。网络分流器依次调用每个已注册的数据包过滤器，如果调用返回结果为真，则把数据包复制到过滤器对应缓存区，用户进程接受信号，继续处理数据包。
数据包过滤器判断数据包是否交给用户程序处理。BPF 采用了有向无环图控制流模型，把判断逻辑对应到一个有向无环图上，这个图又可以直接对应到基于寄存器的计算机架构。

BPF 相比之前的网络过滤器有很显著的性能优势。首先，需要监听数据包的程序多数是网络监测应用，它们只需要所有网络数据包的很小一部分，每个数据包都转换到用户态判断处理会带来巨大开销，BPF 向这些应用提供了一个接口，把简单的逻辑判断放在内核态执行，大大减少了开销。其次，BPF 的过滤器模型可以对应到基于寄存器的计算机模型，由于读写内存是大多数应用程序的性能瓶颈，BPF 相对于基于栈的过滤器模型设计就有了更好的性能。

除此之外，这篇文章中还提出了伪机器（Pseudo-Machine）的设计原则：无关上层协议；通用架构；读取数据次数最小化；指令解码简单；虚拟机寄存器兼容物理机。这些设计原则对于 eBPF 伪机器的设计也有启发。

## 三、Extended Berkeley Packet Filter（eBPF）

Linux Kernel 3.18 引入了 eBPF 模块，并把原有的 BPF 模块改为 cBPF（classic BPF）。现在，内核中的 cBPF 模块已经被移除，cBPF 代码会先转换成 eBPF 代码再被内核执行。尽管 BPF 这个名字起源于计算机网络中的过滤器，但现在它的应用场景已经拓展到了网络以外。
与 BPF 相比，eBPF 主要有以下不同：
- （一）BPF 的挂载点只有用户空间与内核空间的交互；eBPF 可以挂载到执行流的任何阶段，包括（1）硬件设备和内核空间的交互，（2）内核中，（3）内核空间和用户空间的交互，（4）用户态运行的应用。

  以 XDP（eXpress Data Path，快速数据面）为例。这项技术使用了 eBPF 内核功能。XDP 可以在数据包刚刚从网络设备到达时就对其处理，甚至比内核本身更早接触到数据。XDP 可以选择丢弃数据包，直接转发给用户程序，或者转发给内核正常处理流程（比如 TCP/IP 协议栈）。

- （二）eBPF 拓展了 BPF 的架构和指令集。eBPF 虚拟机有 10 个 64 位寄存器、512Bytes 的栈、以及一些高级数据结构。
- （三）eBPF 程序在挂载之前还需要一些额外步骤，以保证安全、性能、扩展性和兼容性。
  - （1）验证阶段（ Verification Stage）。内核检查挂载程序满足：（a）挂载程序的进程有对应权限；（b）挂载程序可以结束，循环必须有退出条件；（c）栈空间不会溢出；（d）程序大小不超过上限；（e）任何执行路径的复杂度都没有超过上限；（f）任何执行路径都不会导致异常。
  - （2）即时编译阶段（JIT Compilation Stage）。将 eBPF 代码编译成优化的机器码，以保证执行效率。
  - （3）eBPF Maps 是 eBPF 提供以实现复杂功能的数据结构，包括哈希表、数组等。这些数据结构可以持久化，并且在不同 eBPF 程序、eBPF 程序与内核空间之间通信。
  - （4）辅助函数（Helper Functions）是 eBPF 程序与内核交互的 API。出于兼容性的考虑，eBPF 程序不能直接使用系统调用。
  - （5）尾递归和函数调用（Tailing and Function Calls）可以让 eBPF 程序调用自身或其他 eBPF 程序，以此实现复杂功能，同时保证每个子程序简单高效。

## 四、应用场景

eBPF 技术已经被工业界和学术界广泛接受，并且自 2016 年至今一直是研究热点。eBPF 现有的主要应用场景有网络、安全、存储、沙盒化、可观测性和链路追踪等方面，以下列举其中的一些应用。

### （一）网络

Cilium 是一款开源软件，用于透明地保护使用 Docker 和 Kubernetes 等 Linux 容器管理平台部署的应用服务之间的网络连接。

Cilium 基于 eBPF，它可以在 Linux 本身中动态插入强大的安全可见性和控制逻辑。由于 eBPF 在 Linux 内核内运行，Cilium 安全策略的应用和更新无需对应用程序代码或容器配置进行任何改动。

### （二）可观测性

bpftrace 是一个用于 Linux eBPF 的高级跟踪语言。bpftrace 使用 LLVM 作为后端，将脚本编译成 eBPF 字节码，并利用 BCC 作为与 Linux eBPF 子系统以及现有的 Linux 追踪能力和附件点进行交互的库。

### （三）安全

Falco 是一个行为活动监视器，旨在检测应用程序中的异常活动。Falco 基于 eBPF 对 Linux 内核层的系统进行监控。它用其他输入流（如容器运行时指标和 Kubernetes 指标）来丰富收集的数据，并允许持续监控和检测容器、应用程序、主机和网络活动。

## 五、发展方向

eBPF 技术由于其显著的性能优势和先进的架构设计，在工业界和学术界都吸引了大量关注。现有 eBPF 使用案例中暴露出的局限性可能成为 eBPF 技术未来发展的方向。

首先，eBPF 代码在执行前需要经过静态分析器的检查和验证，静态分析器的能力限制了 eBPF 程序的复杂度。此外，如何生成简短紧凑的代码以提高性能也是至关重要的。这给程序分析这一领域留下了很多想象的空间。

其次，eBPF 应用都基于安全保证的特点，但 eBPF 程序中还是发现了一些漏洞和问题，需要在攻击者利用它们之前加以解决。无论eBPF验证本身如何，确保基于eBPF的应用程序的安全是一个主要问题。这些基于eBPF的程序引入了新的功能，可能被滥用来绕过验证器并损害系统。

一个重要而有趣的方向是对其他复杂的机器学习模型的研究，如使用 eBPF 的随机森林或深度神经网络。这将为基于机器学习的 eBPF 应用开辟新的途径，用于负载均衡，检测更广泛的威胁，和分析其他性能指标，如能源消耗，内存使用模式等。

最后，网络一直是eBPF应用的关键领域之一。最近， eBPF 已被用于增强 DNS、DNS over TLS 和 DNS over HTTPS 通信的隐私性，且开销较低。另一些研究者采用了 eBPF 来获得实时带内网络遥测信息以进行拥堵控制，从而大大提高了 TCP 的性能。这项开创性的工作为探索流量控制、TCP公平性等开辟了几条令人兴奋的途径。

## 参考文献

[1] McCanne S, Jacobson V. The BSD Packet Filter: A New Architecture for User-level Packet Capture[C]//USENIX winter. 1993, 46.

[2] Sharaf H, Ahmad I, Dimitriou T. Extended Berkeley Packet Filter: An Application Perspective[J]. IEEE Access, 2022.

[3] eBPF. Accessed: Dec. 15, 2022. [Online]. Available: https://ebpf.io/

[4] Kernel Development Community. Accessed: Dec. 15, 2022. [Online]. Available: https://www.kernel.org

[5] BPF and XDP Reference Guide. Accessed: Dec 15, 2022. [Online]. Available: https://docs.cilium.io/en/stable/bpf/

[6] Cilium. Accessed: Dec 23, 2022. [Online]. Available: https://cilium.io/

[7] bpftrace. Accessed: Dec 23, 2022. [Online]. Available: https://bpftrace.org/

[8] Falco. Accessed: Dec 23, 2022. [Online]. Available: https://falco.org/
