---
title: 'From ChatGPT to Sora'
description: 'My understanding about the main idea behind Sora'
date: 2024-02-18
tags: [OpenAI, ChatGPT, Sora]
---

A year after ChatGPT, OpenAI suprised the world again, with its video generation model, Sora. Honestly, I was shocked after skimming the [technical report](https://openai.com/research/video-generation-models-as-world-simulators), even though everyone is familiar with ChatGPT today. I strongly recommend everyone to read the report before all those news and twitters.

Although _model and implementation details are not included in this report_, I follow the references to learn the main idea behind Sora. In this post, I'd like to share my understanding.

## Architecture overview

_Sora is a diffusion transformer_. The remarkable scaling properties of transformer makes it successful in ChatGPT. Sora is also a transformer-based model. The main idea of Sora is to embed the video data into the tokens, with temporal and spatial information encoded.

Since I have brief understanding of ChatGPT, I pay more attention on the differences:
(1)what is diffusion model?
(2)how to embed a video into the tokens?

## Diffusion model

## Embedding the video data
