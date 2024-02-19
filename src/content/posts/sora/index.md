---
title: 'From ChatGPT to Sora'
description: 'My understanding about the main idea behind Sora'
date: 2024-02-18
tags: [OpenAI, ChatGPT, Sora]
draft: true
---

A year after ChatGPT, OpenAI suprised the world again, with its video generation model, Sora. Honestly, I was shocked after skimming the [technical report](https://openai.com/research/video-generation-models-as-world-simulators), even though everyone is familiar with ChatGPT today. I strongly recommend everyone to read the report before all those news and twitters.

Although _model and implementation details are not included in this report_, I follow the references to learn the main idea behind Sora. In this post, I'd like to share my understanding.

## Architecture overview

_Sora is a diffusion transformer_. The remarkable scaling properties of transformer makes it successful in ChatGPT. Sora is also a transformer-based model. The main idea of Sora is to embed the video data into the tokens, with temporal and spatial information encoded.

Since I have brief understanding of ChatGPT, I pay more attention on the differences:
(1)what is diffusion model?
(2)how to embed a video into the tokens?

## Diffusion model

[TBD]

- [ ] Background theory _["Deep unsupervised learning using nonequilibrium thermodynamics." (Sohl-Dickstein, Jascha, et al.)](https://arxiv.org/pdf/1503.03585.pdf)_
- [ ] Diffusion model _["Denoising Diffusion Probabilistic Models" (Ho, Jonathan, Ajay Jain, and Pieter Abbeel.)](https://arxiv.org/pdf/2006.11239.pdf)_
- [ ] Diffusion model with transformer _["Scalable diffusion models with transformers." (Peebles, William, and Saining Xie.)](https://arxiv.org/pdf/2212.09748.pdf)_

## Embedding the video data

[TBD]

- [ ] Transformers for image _["An image is worth 16x16 words: Transformers for image recognition at scale." (Dosovitskiy, Alexey, et al.)](https://arxiv.org/pdf/2010.11929.pdf)_
- [ ] Transformers for video _["Vivit: A video vision transformer." (Arnab, Anurag, et al.)](https://arxiv.org/pdf/2103.15691.pdf)_
- [ ] _["Patch n’pack: Navit, a vision transformer for any aspect ratio and resolution." (Dehghani, Mostafa, et al.)](https://arxiv.org/pdf/2307.06304.pdf)_
