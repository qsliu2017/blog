---
title: 不要再用 ChatGPT 了
date: 2023-05-07
tags: [OpenAI, ChatGPT, GPT, DeepLearning]
---

用 OpenAI 的 [Playground](https://platform.openai.com/playground?mode=chat)。

## 前言

每天打开社交谋体，都会发现又一个 ChatGPT 客户端。其中一些确实不错，更好看的UI、保存聊天记录、常用 prompt。但是，几乎每个客户端在努力做得更像一个聊天机器人。GPT 很强大，但我认为把它当作聊天机器人没有发挥它的全部潜能。

## 不好的做法

1. "继续"

   由于最大长度限制，ChatGPT 一次只能回答 256 个 token。有时回答还没有完成，用户需要输入“继续”来获取剩余的答案。但这会破坏上下文，很有可能答案不再连贯。

2. 使用更多的对话来纠正

   ChatGPT 可能一开始理解错了你的意思。于是你用“不对，我的意思是……”来纠正它。同样，这也会破坏上下文，而且答案通常不如再开始一段新的对话。

   此外，这还会消耗更多的 token，因为这些错误的对话被一遍又一遍地输入。（冷知识：每次对话 GPT 都会重复输入之前所有的对话）

3. 问 ChatGPT 关于它自己的问题

   我看到一些文章，问 ChatGPT 一些关于它自己的问题。比如，“你记住了吗？”然后删除最早的对话，以此减少上下文长度。我不觉得这有什么用。

在我看来，聊天机器人的外表会让人们误以为它是一个聊天机器人，而忽略了它其实是一个文本模型。

## Playground

![OpenAI Playground](./openai_playground.png)

OpenAI 提供了一个更好的 Playground 来使用 GPT 模型。Playground 对我最有用的点是：

1. 控制模型参数，例如 temperature, top-p, frequency penalty。

2. 在不破坏上下文的情况下继续。

   当答案没有完成时，再次点击 submit 可以继续回答。这比在聊天界面中“继续”要好得多。

3. 编辑对话。

   当答案不好时，可以编辑前面的对话，提供更多信息再次尝试。甚至 GPT 的回答也可以编辑，这样 GPT 就会尝试模仿我的风格给出更好的答案。（记住 GPT 是一个文本模型）

## 最好的 GPT 客户端

是 Python Jupyter。

很多时候，使用最原始的 API 就是最灵活最方便的方法。用 Jupyter 笔记本加上 OpenAI 提供的 Python 接口是[我用起来](https://github.com/qsliu2017/OpenAI-Playground)最顺手的方式。它和 playground 有一样的效果，而且还可以结合 OpenAI 的其他 [API](https://platform.openai.com/docs/api-reference)，例如我经常用 `whisper-1` 来音频转文字然后喂给 GPT 问一些问题。

## 结论

聊天机器人的界面是 ChatGPT 爆火很重要的原因。GPT 还称不上强人工智能，于是那些把它当作聊天机器人的人会说“ChatGPT 不过如此”。但是在我看来，把它当作聊天机器人的使用方式掩盖了 GPT 已经是非常先进的文本模型，在绝大部分文本任务上，使用正确的 prompt，它已经取得惊人的表现。也许，GPT 还有很大的潜力，而人们的想象力和使用方式限制了它。
