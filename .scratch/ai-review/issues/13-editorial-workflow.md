# AI-13 · Save drafts, route to legal, and sign off

**Status** in-progress · saved versions work, inbox and human/legal decisions remain  
**Owners** backend and frontend teammates  
**Depends on** AI-02, AI-03

## What to build

An editor can paste an article, script, or caption, add optional source links or production notes, and save it as a version of a story. The editor can find it in the review inbox, record a request for changes, sign off on a routine draft, or assign a legal task for a specific version. The team publishes through its usual tools.

## Completion checks

- [ ] One Editor account can create and review a draft. The inbox shows its latest version and whether it needs review, changes, legal clearance, or sign-off.
- [x] A new submission preserves the previous text and source notes. Two unrelated stories have separate revision histories.
- [ ] The assigned legal reviewer can open the relevant draft and record clearance or a request for changes. The editor can sign off an escalated version after clearance for that version.
- [ ] Legal task access is limited to the assigned copy and legal decision.
- [ ] A revised submission on an escalated story needs a new legal task and fresh clearance before editor sign-off. A pending decision on an older version cannot clear the newer one.
- [ ] The history shows the person, time, version, action, and decision note. The editor can complete a manual review using the saved text.
- [x] Give Deon and the backend a known saved revision for review wiring. AI-09 now uses it through the live PDI path.

## Evidence

The shared app is `x_2236136_suiko_ai`, ID `b47095969f3848a7bdf385b3650b68c2`. On 12 November its workbench saved the river's two versions and a separate library story with their notes and AI histories. The inbox, requests for changes, editor sign-off, and legal tasks remain for the integration teammates. Record their routine and escalated decision traces here when built. [Build plan](../../../PLAN.md)
