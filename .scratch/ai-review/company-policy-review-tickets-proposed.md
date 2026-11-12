# Approved company-policy review ticket breakdown

**Status:** approved by Deon on 12 November 2026; eight individual local tickets published.

**Owner of all eight:** Deon. **Date:** 12 November 2026.

This breakdown implements the [approved specification](company-policy-review-spec.md). The numbers continue the existing AI plan without renumbering earlier work. Each ticket now has its own file under the existing local issue directory and is indexed in the build plan. No new GitHub issues were requested.

Each ticket includes its required schema/API/UI/check changes as one usable slice. Existing records, the app identity and teammates' work remain intact. Existing radio-story evidence is a regression input; do not close or rewrite the earlier evaluation ticket as part of this proposal.

## 1. AI-16 — Keep useful review results and explain failures honestly

**Blocked by:** None; the current review flow already exists.

**What it delivers:** An editor opens a review with useful checked sections even when another section fails, with accurate rule summaries and understandable errors.

**Steps**

1. Reproduce the saved radio-story status/evidence failures using fixed provider responses. Keep expected outcomes separate from observed results.
2. Make a rule's summary agree with its retained findings and unresolved checks. A concern cannot coexist with a falsely clear rule.
3. Distinguish missing evidence, unmatched quotations, contradictory results and inapplicable rules. Preserve the difference between inability to assess and a potential conflict.
4. Validate and retain independent sections of a well-formed reply. Exclude unusable observations, downgrade affected coverage and check that any retained overview remains accurate.
5. Show the actual rejected quote and stored passage for a quote mismatch. Explain missing evidence directly instead of displaying empty quote/source fields.
6. Save and reopen the checked sections, gaps and attempt outcome. Keep malformed overall responses as technical failures with the draft and retry available.

**Done when**

- [ ] The radio regression shows no clear status alongside missing-source findings.
- [ ] An irrelevant outside-media rule can show Not applicable without an invented quote.
- [ ] A bad finding leaves independent checked results usable and clearly labels the remaining gap.
- [ ] A wholly malformed response remains a failed attempt rather than a fabricated review.

**Ask your AI**

> Work on AI-16 from the approved company-policy review specification. Use the saved failure examples and injected provider responses to reproduce the problem first. Keep the change inside review validation, saved results and the AI panel; preserve human workflow actions. Demonstrate the difference between a partial usable review and a technical failure. Record what passed and what remains unresolved.

## 2. AI-17 — Save format, kind, source links and review context with each version

**Blocked by:** None; the saved-story and revision flow already exists.

**What it delivers:** An editor chooses format/kind, supplies links and context separately, saves a version, and reopens exactly those inputs for that version's review.

**Steps**

1. Add article/script/caption and news/opinion/sponsored choices to the existing Story screen and saved revision data.
2. Add separate Sources and optional Review context inputs. Accept up to five distinct public URLs; do not require manual claim-to-link mapping.
3. Validate choices and limits on save. Keep old notes readable and ask for explicit classification on legacy stories rather than silently inventing it.
4. Include the saved values in review input and the revision display. Later edits must not change an earlier saved copy.
5. Make source status honest during staged delivery: links are unread until a later source-reading slice actually retrieves them.
6. Confirm existing first-draft review, metadata choices and saved stories still work.

**Done when**

- [ ] A saved article and a saved script retain their own format, kind, links and context.
- [ ] Reopening an older version shows its original inputs after a newer version is saved.
- [ ] The UI never implies that merely saving a URL means its page has been read.

**Ask your AI**

> Work on AI-17. Extend the existing saved-revision journey end to end with format, kind, Sources and Review context. Preserve legacy stories and notes, enforce limits on the server, and prove that reopening a revision restores its exact inputs. Source retrieval and policy proposal generation belong to later tickets; keep their current status visible and honest.

## 3. AI-18 — Approve editable starter rules and editor-written rules

**Blocked by:** AI-17, because approved applicability uses the saved format/kind choices.

**What it delivers:** A designated editor approves, edits, disables or replaces reusable rules, and a story review uses the correct approved versions and applicability.

**Steps**

1. Offer the five approved starter templates as suggestions. Identify their origin and show what each can check or needs a human to establish.
2. Support an editor-written rule with unchanged wording. Record format/kind applicability, additional conditions and priority.
3. Add an explicit approval action recording the authorized editor, time and exact rule version. Suggestions stay inactive until approved.
4. Preserve the last approved version while a proposed edit awaits approval. Explicit disablement removes the rule from future active checks.
5. Use approved scope during review and explain Not applicable or Needs confirmation. Preserve the exact rule version with the result.
6. Keep legacy rules/history readable and label unrecorded approval honestly. Verify the designated editor can manage rules while an everyday Editor can review but cannot approve shared rules.

**Done when**

- [ ] An approved manual headline rule works on a relevant story and is explained as inapplicable where its scope excludes that story.
- [ ] An unapproved template or edit cannot silently become active.
- [ ] Earlier reviews still show their original rule wording after an approved replacement.
- [ ] Checks requiring a capability not implemented yet explain the need for confirmation.

**Ask your AI**

> Work on AI-18. Reuse the existing rule editor and snapshots. Make starter templates, manual wording, explicit approval, applicability and version replacement work through the existing ServiceNow screens and review action. Preserve historical records and prove the designated-editor permission boundary. Keep company rules separate from human story sign-off.

## 4. AI-19 — Turn company policy into editable proposed checks

**Blocked by:** AI-18, which supplies the rule approval and versioning flow.

**What it delivers:** An editor pastes policy text or requests refinement, inspects proposed checks beside their original passages, and approves only the checks they want to use.

**Steps**

1. Save a bounded pasted policy version, with passages that can be referenced.
2. Offer Use my wording and Suggest checks/refine options. Reuse the existing Gemini configuration for the optional suggestion operation.
3. Request proposed wording, exact policy passage references, applicability, supported check requirements and unresolved questions in a defined response structure.
4. Verify references against the saved policy. Show proposals beside their original text; identify unclear instructions, lost qualifications or unsupported capabilities for human review.
5. Let the editor edit, discard or approve individual proposals through AI-18. A model reply never activates policy by itself.
6. Test short policies with exceptions and conflicting/vague instructions. Save expected versus observed proposals before deciding whether a more complex extractor is needed.

**Done when**

- [ ] The editor can move from pasted policy to an approved rule used by a story review.
- [ ] Original wording and passage references remain inspectable after refinement.
- [ ] Failed proposals and discarded checks do not become active rules.
- [ ] The first path works through direct Gemini plus application checks without adding LangExtract or a Python service.

**Ask your AI**

> Work on AI-19. Build the pasted-policy-to-proposed-rule journey on top of the existing Gemini integration and approved rule flow. Preserve policy meaning, conditions and exceptions; show exact supporting passages and make all generated checks await editor approval. Start with the smallest implementation and existing tests. Consider another extractor only after recording a concrete quality gap.

## 5. AI-20 — Read linked sources and retain inspectable evidence

**Blocked by:** AI-18, which also includes AI-17. The run needs saved URLs and an approved rule indicating that source reading is relevant.

**What it delivers:** When a review needs sources, the editor sees which supplied pages/text PDFs were read, the actual retained material, and clear reasons for pages that could not be used.

**Steps**

1. Prepare public fixtures with expected text: a normal page, a text PDF, an unrelated page, a missing page and an incomplete/changed-page case.
2. Prove a bounded text-returning reader from the PDI. Trial Jina first; record extraction, timing, limits and failure behaviour before adopting it. Evaluate an alternative only if the proof identifies a need.
3. Read up to five supplied public links when an approved rule requires external material. Set explicit source-size/time limits, handle redirects and reject unsupported/private targets at this boundary.
4. Preserve per-attempt source text, stable passage references, URLs, retrieval outcomes/times and fingerprints. Keep a new reading attempt separate from previous evidence.
5. Add source evidence cards to the review panel, including inaccessible/partial outcomes. Distinguish editor-pasted context and an unread URL from a retrieved source.
6. Reopen a saved review after a test page changes and demonstrate that the old review retains the old material. This slice establishes source reading; claim support is assessed in AI-21.

**Done when**

- [ ] The actual PDI reads a public page and a text PDF and preserves expected passages.
- [ ] Missing or incomplete content produces a visible limitation without destroying other review sections.
- [ ] Old source material survives another review of changed source content.
- [ ] Source reading itself is never presented as proof that every story claim is supported.

**Ask your AI**

> Work on AI-20. Prove source retrieval through ServiceNow before adopting a reader. Use controlled public fixtures and an injectable reader for repeatable cases. Save the exact material available to a review and show it with clear retrieval outcomes in the existing AI panel. Respect the five-link limit and preserve earlier snapshots. Do not add independent web search or require manual claim mapping.

## 6. AI-21 — Match claims to sources and show rule-linked results

**Blocked by:** AI-16 and AI-20. Their prerequisites also supply approved rules and saved inputs.

**What it delivers:** An editor sees which relevant claims the retrieved sources support, which need confirmation and which potentially conflict with an approved rule, with inspectable passages and useful next actions.

**Steps**

1. Add retained source passages to the frozen review input with distinct identities from story text, policy and supplied context.
2. Under applicable company rules, have Gemini assess relevant claims individually and match passages automatically.
3. Verify each claim/source quotation against the saved material. One supported claim must not clear other claims; an unrelated page or supplied assertion cannot masquerade as retrieved evidence.
4. Show Potential conflict, Needs confirmation, No issue found and Not applicable consistently. Include both conflict and unresolved coverage when a rule has both.
5. Preserve checked results when a page or finding fails. Offer a concrete next action and keep public metadata free of flagged/unconfirmed claims and internal-only material.
6. Test a mixed-claim article, a contradictory source, an irrelevant source and a permission note before a fresh live run. Save expectations first and retain actual results.

**Done when**

- [ ] Bare URLs produce inspectable claim/source matches without editor-written mappings.
- [ ] A story with supported and unsupported claims shows both accurately.
- [ ] A contradiction shows both passages without claiming independent truth certification.
- [ ] Rule summaries, retained findings, coverage and suggested public description agree.

**Ask your AI**

> Work on AI-21. Use the approved company rules and frozen source snapshots to assess relevant claims individually. Return exact story/source references, clear uncertainty and actionable rule-linked findings. Reuse partial-result handling and verify quoted passages before showing checked results. Write expectations for mixed supported, unsupported, unrelated and contradictory cases before calling Gemini.

## 7. AI-22 — Ground revision summaries in actual text changes

**Blocked by:** AI-16, which establishes the checked-section and coverage behaviour used by this comparison.

**What it delivers:** An editor sees a reliable comparison with the previous submitted version, including grouped repeated fact changes and removed attribution, while first-version reviews remain useful.

**Steps**

1. Confirm old/new submitted copies and their comparison scope are preserved before the run.
2. Prove a standard difference library such as jsdiff in the SDK/runtime, using pure text operations. Reuse the existing implementation if it already meets the same tests more simply.
3. Supply literal changes as context for Gemini's editorial explanation. Preserve the full candidate text for policy review.
4. Group repeated updates to the same fact and identify changed/removed attribution. Quote before/after passages accurately.
5. Reject invented edits or references without hiding unrelated valid review sections. Keep first drafts as reviews with no comparison requested.
6. Recheck the library date/source example and the partly shortened caption case, plus an unchanged copy. Save the input, expected edit list and actual comparison.

**Done when**

- [ ] A repeated schedule change appears once with relevant before/after evidence.
- [ ] Removed attribution is identified without inventing another edit.
- [ ] A shortened caption accurately distinguishes deleted and retained wording.
- [ ] Identical versions and first drafts do not produce invented changes.

**Ask your AI**

> Work on AI-22. Ground the comparison in actual saved-text differences, then use Gemini to explain the editorial meaning. Evaluate a standard difference library for the existing SDK rather than writing another matcher unnecessarily. Keep repeated-fact grouping, removed attribution and partly shortened captions covered by expected examples. Preserve first-draft review and independent policy/metadata results.

## 8. AI-23 — Prove the complete AI review flow and record its limits

**Blocked by:** AI-19, AI-21 and AI-22; these transitively include the other slices.

**What it delivers:** Deon can demonstrate the agreed feature in ServiceNow and show saved evidence of what Gemini got right, wrong and could not check.

**Steps**

1. Prepare a fictional publisher policy, a fresh article, an unrelated script and a revision. Record expected policy applicability, findings, metadata and meaningful changes before the first live review.
2. Approve both an editor-written rule and a rule proposed from policy, then run the first story from the actual panel.
3. Inspect claim/source evidence, save a human metadata choice, revise the story and review the new version.
4. Reopen the earlier review after changing a rule and a public source fixture. Verify old evidence and the new attempt remain distinct.
5. Exercise broken-link, bad-quote, contradictory-status and partial-result examples with fixed responses through the review entry point. Verify the ordinary Editor/designated editor boundary for this feature.
6. Record inputs, versions, actual model, expected versus actual observations, remaining gaps and the next justified improvement. Keep the earlier AI-11 outcomes as historical evidence.

**Done when**

- [ ] The complete AI feature works from the PDI UI with inspectable saved evidence.
- [ ] A fresh example has been assessed without editing the expected result after seeing Gemini's answer.
- [ ] Repeatable checks cover the known failure cases without requiring repeated live error calls.
- [ ] The handoff states which assignment capabilities this proves and which teammate workflow work still remains.

**Ask your AI**

> Work on AI-23 after its blockers are complete. Evaluate the whole agreed AI feature through the ServiceNow UI, using a fresh article, unrelated script and revision with expectations written first. Inspect actual saved inputs, policy versions and retrieved material. Report useful results, misses, false concerns and technical gaps honestly, and recommend the next change from evidence. Keep human/legal workflow ownership with the existing team tickets.

## Suggested order

Start with **AI-16** to fix the confusing behaviour already observed. **AI-17** is also unblocked. Then build AI-18; AI-19 and AI-20 can follow independently. AI-22 follows AI-16, AI-21 follows AI-16 plus AI-20, and AI-23 brings the feature together.

No new ticket is blocked by completion of a teammate's GitHub issue. Feature-specific interfaces still need coordination when touching shared Story screens or records. Whole-app human/legal sign-off and the team's final demo remain separate integration work.

## Approval and execution

Deon approved the eight-ticket split and its blocking edges. He then authorized an active goal to implement all eight, with a separate commit and pull request to main for each ticket. He retains PR review and merge authority. Record progress and evidence in each local ticket and the implementation log.
