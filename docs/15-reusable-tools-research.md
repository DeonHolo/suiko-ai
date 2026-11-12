# Reusable tools for Suiko AI

Checked on **12 November 2026**. This is a planning shortlist. Nothing listed here was installed, connected to the PDI, or tested with the team's credentials during this research. Prices and quotas can change.

## Recommended starting point

Keep the existing ServiceNow app and Gemini integration. First evaluate a reader that returns actual page text, a standard text-difference library, and schema-based extraction of policy checks. Keep the existing review checks and human approval. Compare LangExtract if the simpler policy extraction misses clauses or produces weak passage references.

LangExtract accepts text; it is not restricted to PDFs. It remains optional, with no mandatory installation, service or benchmark in the first build. [Official text-input example](https://github.com/google/langextract#quick-start).

The intended division of work is:

1. **Reader:** retrieve the supplied public page or text PDF and return readable material.
2. **Saved source snapshot:** retain the material actually supplied to this review, its URL, retrieval outcome and time.
3. **Text comparison:** identify literal edits between the story's submitted versions.
4. **Gemini:** propose policy checks or explain a story's changes, source support, applicable concerns and metadata.
5. **Application checks:** verify IDs, quoted passages, coverage and status consistency before showing a checked result.
6. **Editor:** approve company rules, assess findings and choose metadata. Existing human/legal workflow retains publishing authority.

This is a proposed design. A small ServiceNow integration proof must establish whether the selected reader and package work in the actual app before they become dependencies.

## Shortlist

| Tool | Useful job | Free/cost reality | ServiceNow fit and recommendation |
| --- | --- | --- | --- |
| **Gemini structured outputs** | Return proposed rules with policy passages, applicability and unanswered questions in a defined structure. Also supports the existing review response. | Uses the existing API key and project quota. Google's current Flash-Lite pricing includes a limited free tier; paid usage follows model token prices. | First candidate for pasted policies. Reuses the REST integration and local validators. Correct JSON does not establish a correct interpretation. [Structured outputs](https://aistudio.google.com/docs/structured-output), [pricing](https://aistudio.google.com/docs/pricing#gemini-3.5-flash-lite). |
| **Jina Reader API** | Convert a supplied webpage or PDF URL into readable text/Markdown that Suiko can retain. | Basic keyless Reader use is currently free at **20 requests/minute**. Keyed use has different limits and token accounting. This is bounded service access, not unlimited free capacity. | First source-reader candidate to prove from the PDI using public fixtures. HTTP access avoids hosting a browser or Python service. Five-link reviews, latency, shared outbound-IP limits and incomplete extraction need testing. [Reader and limits](https://jina.ai/reader/), [API reference](https://docs.jina.ai/api.md). |
| **Firecrawl hosted API** | Retrieve pages into formats such as Markdown, with page metadata. | Current public pricing lists **1,000 free credits/month**, two concurrent requests and low rate limits; basic page scraping is one credit/page. Other formats and operations can cost more. Requires an account/key for the regular hosted API. | Candidate alternative if Jina's tested extraction or access is inadequate. Keep a reader interface so changing provider does not change the editor workflow. Do not build two production readers at once. [Scrape documentation](https://docs.firecrawl.dev/features/scrape), [pricing](https://www.firecrawl.dev/pricing). |
| **Google LangExtract** | Extract policy clauses and attributes with document alignment, chunking and multi-pass helpers. | Apache-2.0 Python library; cloud model calls still use quota/billing. Local Ollama is supported but needs a running model and suitable hardware. | Useful comparison candidate for policy extraction. It needs Python 3.10+ outside ServiceNow's JavaScript runtime, or a local preparation step. Adopt only if a controlled comparison justifies that extra deployment work. [Repository](https://github.com/google/langextract), [requirements](https://github.com/google/langextract/blob/main/pyproject.toml), [license](https://github.com/google/langextract/blob/main/LICENSE). |
| **jsdiff** | Produce word/line changes between saved story versions without asking Gemini to reconstruct every edit. | BSD-3-Clause JavaScript library; no inference API or per-call fee. | Candidate for the existing build, subject to SDK/runtime verification. Gemini would explain editorial significance and group repeated changes to a fact. A literal diff alone cannot judge whether meaning was preserved. [Repository and API](https://github.com/kpdecker/jsdiff). |
| **Promptfoo** | Run the same prepared review cases across prompt versions and compare results. | MIT-licensed local CLI/library. Calls to Gemini still consume model quota or billing. | Optional developer tool. It can call a custom review adapter and retain comparison reports; keep existing Node tests for repeatable validation failures. It is not a new production service. [Overview](https://www.promptfoo.dev/docs/intro/), [license statement](https://www.promptfoo.dev/docs/contributing/). |
| **Mozilla Readability / PDF.js** | Extract readable HTML content or handle PDF text/viewing in a controlled application. | Open-source libraries; hosting and integration effort remain. | Reference alternatives if self-hosted extraction or uploaded PDFs become necessary. Readability requires a DOM implementation; Node examples add jsdom. This adds runtime work compared with calling a hosted reader. [Readability](https://github.com/mozilla/readability), [PDF.js](https://mozilla.github.io/pdf.js/getting_started/). |

## Why LangExtract is useful without being an automatic choice

LangExtract can use Gemini underneath. It adds extraction and alignment machinery around the model; it does not replace editorial judgment.

Its offsets can locate extracted text in the supplied policy. Alignment can be exact, partial or fuzzy, and may fail. Suiko should check the actual source substring before presenting a verbatim policy quotation. An aligned passage still does not establish that the proposed check preserves every qualification or exception. [Alignment settings](https://github.com/google/langextract/blob/main/skills/langextract-usage/references/resolver-params.md), [extraction data types](https://github.com/google/langextract/blob/main/langextract/core/data.py).

Compare the two routes using the same short policies, examples and human-written expectations:

- Was each expected policy requirement captured?
- Did the proposal preserve exceptions and conditional wording?
- Does its quoted passage exist verbatim in the saved policy?
- Does its applicability match the policy?
- Did it introduce requirements that the company never supplied?
- How much editor correction, elapsed time, model usage and hosting work does it require?

A longer document is a reason to test LangExtract, not evidence that it will necessarily beat the simpler route. Label Studio Community Edition is an optional text-annotation tool if preparing expected spans becomes burdensome; the initial scorecards can remain Markdown/JSON. [Label Studio repository](https://github.com/HumanSignal/label-studio), [text annotation example](https://labelstud.io/templates/named_entity).

## Gemini's built-in URL reading is another route

Google documents URL Context support for both the configured Gemini 3.5 Flash-Lite and its existing 3.1 Flash-Lite fallback. It reads supplied public URLs, has supported-content restrictions, and counts retrieved material as model input. The documentation describes retrieval outcomes and citations. This capability is **not enabled in the current Suiko provider request**. [URL Context](https://aistudio.google.com/docs/url-context).

For Suiko, source reading must also preserve inspectable evidence. A citation or reported retrieval success alone does not give the app a complete saved text snapshot against which to validate a proposed quotation. A reader returning text is therefore the first candidate for the agreed evidence workflow. Verify this in a small integration proof; use built-in URL Context if that route can meet the same evidence requirements. Do not silently combine different source versions in one review.

Jina documents cache controls that can request a fresh retrieval. Record the request/retrieval time and any available cache information accurately. A retrieval timestamp is not proof of when the publisher last updated the source. [Reader cache controls](https://docs.jina.ai/api.md).

## Platform and product references

ServiceNow SDK supports JavaScript modules and compatible bundled third-party libraries. Its runtime does not support Node.js APIs. A package working on a laptop therefore needs a build/runtime check before using it inside the PDI; Python, browser automation and DOM requirements need a suitable separate runtime. [ServiceNow JavaScript modules](https://servicenow.github.io/sdk/guides/module-guide).

Filestage's custom review agents provide a workflow reference for reusable instructions and context documents inside review work. Acrolinx provides a reference for organization-specific guidelines and terminology. Use these to study setup and editor feedback; they are not proposed production dependencies or promises of free service. [Filestage review agents](https://help.filestage.io/en/articles/9465074-how-to-get-started-with-review-agents), [Acrolinx FAQ](https://www.acrolinx.com/frequently-asked-questions/).

## First proof to schedule

Use clearly labelled public test pages and a text PDF, with expected content written down first. Include a matching source, an unrelated page, a contradictory passage, a missing page, a page changed between reviews and a page whose extraction omits important text. Confirm the PDI can retrieve and retain the expected material. Then check that Gemini points to those saved passages and reports gaps honestly.

Keep this proof small and reusable in the later full-flow tests. Do not make a new vendor account, install a Python service, or replace the working review path solely because a tool appears on this list.
