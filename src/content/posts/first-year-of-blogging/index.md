---
date: 2024-04-07
theme: tufte
---

# First Year of Blogging

<section>

There is no such a moment that I suddenly made up my mind and became a weekly blogger. Actually I built my site at the end of 2022, using Hugo and its default theme. After that I just periodly put my notes and code snippets on it, but never take it seriously. About a year ago, the last year of my undergraduate, I was preparing for my thesis project about eBPF. I found there was a lack of beginner-friendly tutorials on eBPF, so I documented my exploration process into a tutorial and published it on my blog. A few days later, I found it on [ebpf.io](https://ebpf.io), the official eBPF community website. And I even received some emails discussing it. This is the first feedback I received from my blogging efforts. Hence, I consider this tutorial as the beginning of my blogging journey.

I had the idea of writing blogs much earlier. Back at school, I gave over ten presentations in a class, and a teaching assistant encouraged me to write these contents into blog posts (who also guided me into the open source world, thank you!). However, looking back, these _fashion_ techniques became old-fashion very soon, and don't seem to hold much value now, so I didn't bother organizing them later. But that's when I first realized I could write.

Looking at the timeline on my site, the first English blog post was [Postgres XID wraparound failure](https://blog.qsliu.dev/post/postgres-xid-wraparound-failure/). It was an interview homework of Bytebase. Although it seems trivial now, I spent two weeks collecting information and reading to finish it (that's the 1 BC of ChatGPT). It's worth mentioning that writing is highly encouraged at Bytebase, and my boss there, the coolest and most creative person I've ever met in the real world, writes good stuffs. He is one of the reasons why I start and continue writing.

One day during the lockdown, I wrote an essay about _why am I not writing_ at the time. Even though I didn't write much immediately after that, clarifying my hesitation in writing was a good start. Later on, I wrote some things from time to time, most of which were just some programming problems I met and the methods to solve them. "Just write" is the only suggestion I would give to anyone who wants to start writing.

But now I still hesitate when I start a new post, "Are these worth writing?". That kind of question-and-answer writing seems to be less valuable since LLMs can do it much better. Even if I myself want to know the answer to this question a few months later, I would rather ask ChatGPT than read my own blog post.

</section>

<section>

Is writing blog posts still worth it in the age of AI? I still read human-written blogs today and always find something interesting in them. There is a page on my site collecting my favorite blogs which, from a particular perspective, are a reflection of my ideal blog. Maybe it's time to go over them to find out what mine was made for.

[The Writings of Leslie Lamport] collects nearly 200 writings of Leslie Lamport, one of the most famous mathematicians and computer scientists. Most of them are formal academic papers, and many of them have had a great impact on this field, such as Paxos. He even invented LaTex! What impressed me most is that his first paper was written in high school, and the most recent one was just a month ago!

[paulgraham.com], as of this writing, has 222 essays of Paul Graham, the famous writer (who wrote _Hackers & Painters_) and investor (who co-founded Y Combinator). This blog must be one of the most successful blogs ever in the world. I find that Paul's essays are kind of _eye-catching_. Simple words and short sentences make it easy to read in one breath. Analogies and examples make it easily understandable. Just like a talk or speech. In fact, many of his essays come from speech drafts. The biggest, if not the only, purpose of this type of writing is to spread his original and brilliant viewpoints. Because he's a writer as well as an investor.

<div class="epigraph">

> Write for a reader who won't read the essay as carefully as you do, just as pop songs are designed to sound ok on crappy car radios.
>
> <footer>Paul Graham, "Writing, Briefly"</footer>

</div>

Except for Leslie and Paul, both of whom are one-in-a-generation talents, there are also some blogs from the best engineers in this industry. [Mara's Blog], [research!rsc], [without.boats] and [Eric Holk] are some of my favorites, sharing thoughts and tradeoffs behind design, especially for PLs and systems.

Somehow these perfect blogs make me hesitate to write. Yes, I do write to express myself. I'm not that kind of who can speak, but I do come up with ideas that I'm dying to share. However these ego prevents me from writing. I doubt it if my ideas are valuable. Do I misunderstand something? Do I have the ability to express my thoughts clearly?

[Simon Willison's TILs] is the opposite of perfect writing, in a way. TIL stands for _**T**oday **I** **L**earned_. This type of blogs drops the barrier and just writes something you learn today. Many of them are just a few lines long, such as "Installing tools written in Go", but he has content to write almost every day. And the original idea, mentioned in [One year of TILs], has over 1400 TILs now.

TIL reminds me that I also write to learn. Back in high school, I refactored (I didn't know this word) my notes over and over again. Not like other kids, I did not use note as a cheatsheet, and seldomly looked at them again. In fact, I found that rearranging notes and writing them down helped the most. Now when I write down and read my thoughts, I can find the gaps in my understanding and fill them.

[Metadata], in a way, matches this idea. This blog collects the reading notes of papers, most of which are about distributed systems. The reading notes are not for others, but for himself. He writes to understand the paper, and to find the wasted efforts in the research not shown in the paper (because paper is for reviewers). To keep himself noticing things, he set a goal of blogging once a week.

<div class="epigraph">

> This (_goal of blogging once a week_) also helps me lower my standards for writing, which paradoxically maintains and raises my standards.
>
> <footer>Murat Demirbas, "Why I blog"</footer>

</div>

Will I continue to write? Definitely. LLMs can provide answers, but never provide thoughts. Writing helps me to find other's thoughts and to express my own. I'd like to write better things in the future. I gain the following suggestions from [Phil Eaton], yet another blog I like.

<div class="epigraph">

> - Show working code
> - Make things simpler
> - Talk about tradeoffs and downsides
> <footer>Phil Eaton, "What makes a great technical blog"</footer>

</div>

</section>

[The Writings of Leslie Lamport]: https://lamport.azurewebsites.net/pubs/pubs.html
[paulgraham.com]: https://www.paulgraham.com/index.html
[Mara's Blog]: https://blog.m-ou.se/
[research!rsc]: https://research.swtch.com/
[without.boats]: https://without.boats/
[Eric Holk]: https://theincredibleholk.org/
[Simon Willison's TILs]: https://til.simonwillison.net/
[One year of TILs]: https://simonwillison.net/2021/May/2/one-year-of-tils/
[Metadata]: https://muratbuffalo.blogspot.com/
[Phil Eaton]: https://eatonphil.com/
