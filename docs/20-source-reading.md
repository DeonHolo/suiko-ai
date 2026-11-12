# Read and reopen saved source material

Paste up to five public webpage or text PDF URLs into **Sources**. An approved rule with **Needs source material** and a matching format and kind triggers reading when you review the saved version. Paste interview excerpts and production notes into **Review context**.

Open **Source material** in the review. Each card shows the requested URL, its outcome, and the time Suiko asked the reader. Expand **Read saved passages** to see the text captured for that attempt. A partly read or inaccessible page explains the gap and offers a next step. Source cards also remain available if Gemini needs a retry.

Suiko uses Jina Reader's public text response through a fixed outbound endpoint. It asks for a fresh read, allows up to seven seconds per link and budgets 18 seconds across the batch. It keeps up to 6,000 characters per source and saves passage IDs and a SHA-256 fingerprint. It shows cache information when the reader reports it. Retrieval time describes when Suiko read the copy. See the [Jina Reader reference](https://docs.jina.ai/api.md).

## ServiceNow evidence

The first review of the fictional **Juniper Cut Media plans a Makers’ Night segment** saved these results on 12 November 2026 UTC.

| Source | What ServiceNow saved | Elapsed |
| --- | --- | --- |
| Fictional production brief | 6 p.m. on 17 May, a 120-seat room | 5.9 s |
| W3C text PDF | “Dummy PDF file” | 0.3 s |
| IANA Example Domains | Readable webpage unrelated to the story | 1.2 s |
| Missing page | Original HTTP 404, with a prompt to paste an excerpt | 0.8 s |
| W3C WCAG 2.2 | Partly read. The review shows the 6,000-character limit. | 2.0 s |

The first review retained its overview and other usable sections. After the fictional brief changed to 7 p.m., a first retry retained an older copy and Gemini was busy. A later review of the **same story version and URL** saved 7 p.m. with a different fingerprint. Reopening the first review still showed 6 p.m. The reader provides the material for the claim-by-claim review in AI-21.

- Story `07a9114983a89b106fffc629feaad357`.
- First review `13a9514983a89b106fffc629feaad3d4`, provider-busy retry `4bca99c983a89b106fffc629feaad3e3`, refreshed review `527a76498364db106fffc629feaad317`.
- The local suite covers the rule gate, failed and partial links, unsafe redirects, the time budget, separate snapshots and the two text fields observed across the reader's response modes. Both modes returned the original page status, including a 404 inside an HTTP 200 response. The SDK build and installed page and API smoke checks passed.
- A cache warning and an incomplete extraction can appear together. The result retains both facts.
- The original and refreshed screenshots, saved source text, timings and expectations are in the ignored `ai-review/output/ai-20-2026-11-12/` folder.
